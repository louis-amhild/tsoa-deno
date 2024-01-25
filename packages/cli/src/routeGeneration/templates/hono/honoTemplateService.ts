/// <reference lib="deno.ns" />

import { Buffer } from "https://deno.land/x/node_buffer@1.1.0/src/buffer.js";
import { Readable } from 'https://deno.land/x/readable_stream@v3.6.0-deno.0.3.0/mod.ts';
import { encode as bufferToBase64 } from "https://deno.land/std@0.64.0/encoding/base64.ts";
import { HTTPException, Next, type Context as HonoContext } from '@hono';

import { HttpStatusCodeLiteral, File as TsoaFile, FieldErrors, ValidateError, TsoaRoute, Controller, TemplateService } from '@tsoa/runtime';

/**
 * Create a Tsoa compatible Hono context type that contains any request data available for consumption synchronously.
 * This type also modifies the Hono context req type to be compatible with Tsoa Request format (that assumes the 'query' 
 * member is a map and not a getter function). In comparison to a Hono query map, this type supports string or string[] 
 * (ensuring that not all string queries are converted to arrays like in std. Hono context).
 */
export type Context = Omit<HonoContext, 'req'> & {
  // Change query parameter of req to be compatible with TSOA Request (@Request)
  req: Omit<HonoContext['req'], 'query'> & {
    query: Record<string, string | string[]>
    parsedBody: Record<string, any> | string;
  };
  // Add the generated response to context, indicating when a response has already been generated
  generatedResponse?: Response;
  // Additional files map to retrive files in TSOA/Multer format synch
  files: Record<string, TsoaFile | TsoaFile[]>;
  form: Record<string, any>;
};


export function isTsoaContext(obj: any): obj is Context {
  return (
    obj != null &&
    typeof obj === 'object' &&
    'req' in obj &&
    'query' in obj.req &&
    typeof obj.req.query === 'object' &&
    'files' in obj &&
    typeof obj.files === 'object' &&
    'form' in obj &&
    typeof obj.form === 'object'
  );
}
type ResponseTypes = string | object | number | boolean | void;
type HonoApiHandlerParameters = {
  methodName: string;
  controller: Controller | Object;
  context: Context;
  validatedArgs: any[];
  successStatus?: number;
};

type HonoValidationArgsParameters = {
  args: Record<string, TsoaRoute.ParameterSchema>;
  context: Context;
  next: Next;
};

type HonoReturnHandlerParameters = {
  context: Context;
  next?: Next;
  headers: Record<string, string | string[]>;
  statusCode?: number;
  data?: ResponseTypes;
};

/**
 * Hono Template Service helper implementing request parsing, verification and response generation 
 * for the Hono hbs (Handlebars) Tsoa template.
 */
export class HonoTemplateService extends TemplateService<HonoApiHandlerParameters, HonoValidationArgsParameters, HonoReturnHandlerParameters> {
  constructor(
    models: TsoaRoute.Models,
    private readonly minimalSwaggerConfig: any,
  ) {
    super(models);
  }

  async apiHandler(params: HonoApiHandlerParameters): Promise<any> {
    const { methodName, controller, context, validatedArgs, successStatus } = params;
    const promise = this.buildPromise(methodName, controller, validatedArgs);

    let statusCode = successStatus;
    let headers: ReturnType<Controller['getHeaders']> = {};
    const data = await promise.catch((error: any) => {
      throw new HTTPException(error?.status || 500, { message: error?.message || "Unknown error" });
    });

    if (this.isController(controller)) {
      headers = controller.getHeaders();
      statusCode = controller.getStatus() || statusCode;
    }

    return this.returnHandler({ context, headers: this.removeUndefinedHeaders(headers), statusCode, data });
  }

  /**
   * Convert header map to flat array of strings (string[] is not supported by Deno/Hono)
   */
  private removeUndefinedHeaders(headerMap: Record<string, string | string[] | undefined> | undefined): Record<string, string | string[]> {
    if (!headerMap) return {};
    const definedHeaders: Record<string, string | string[]> = {};
    Object.keys(headerMap).forEach(key => {
      const value = headerMap[key];
      if (value !== undefined) definedHeaders[key] = value;
    });
    return definedHeaders;
  }


  private identifyObject(obj: ResponseTypes) {
    if (obj === null) {
      return 'null';
    } else if (obj === undefined) {
      return 'undefined';
    } else if (typeof obj === 'string') {
      return 'String';
    } else if (typeof obj === 'boolean') {
      return "Boolean";
    } else if (typeof obj === 'number') {
      return 'Number';
    } else if (obj instanceof ArrayBuffer) {
      return 'ArrayBuffer';
    } else if (obj instanceof Buffer) {
      return 'Buffer';
    } else if (typeof obj === 'object') {
      return 'Object';
    } else {
      throw new Error('Unknown type');
    }
  }

  protected returnHandler(args: HonoReturnHandlerParameters): Response {
    const { context, headers, statusCode, data } = args;

    if (context.generatedResponse) return context.generatedResponse;

    switch (this.identifyObject(data)) {
      case 'undefined':
      case 'null':
        return context.body(null, statusCode || 204, headers);
      case 'Number':
      case 'Boolean':
      case 'String':
        return context.text(data?.toString() || '', statusCode || 200, headers);
      case 'ArrayBuffer':
      case 'Buffer': {
        return context.body(data as ArrayBuffer, statusCode || 200, headers);
      }
      case 'Object': {
        // The default status in required for hono to set the headers
        return context.json(data, statusCode || 200, headers);
      }
    }
  }

  /**
   * Get arguments from the request (header, query  or body) parse and validate them according to TSOA controller specification.
   * @returns a list of parsed arguments or throws a ValidateError.
   */
  public getValidatedArgs(params: HonoValidationArgsParameters): any[] {
    const fieldErrors: FieldErrors = {};
    const { args, context, next } = params;

    const values = Object.keys(args).map((key) => {
      const param = args[key];
      const name = param?.name;
      const bodyProps = (typeof context.req.parsedBody == 'object') ? context.req.parsedBody : {};

      switch (param.in) {
        case 'request':
          return context.req;
        case 'query':
          return this.validationService.ValidateParam(param, context.req.query[name], name, fieldErrors, undefined, this.minimalSwaggerConfig);
        case 'queries':
          return this.validationService.ValidateParam(param, context.req.query, name, fieldErrors, undefined, this.minimalSwaggerConfig);
        case 'path':
          return this.validationService.ValidateParam(param, context.req.param(name), name, fieldErrors, undefined, this.minimalSwaggerConfig);
        case 'header':
          return this.validationService.ValidateParam(param, context.req.raw.headers.get(name) ?? undefined, name, fieldErrors, undefined, this.minimalSwaggerConfig);
        case 'body':
          return this.validationService.ValidateParam(param, bodyProps, name, fieldErrors, undefined, this.minimalSwaggerConfig);
        case 'body-prop':
          return this.validationService.ValidateParam(param, bodyProps[name], name, fieldErrors, 'body.', this.minimalSwaggerConfig);
        case 'request-prop':
          return this.validationService.ValidateParam(param, bodyProps, name, fieldErrors, undefined, this.minimalSwaggerConfig);
        case 'formData': {
          const files = Object.keys(args).filter(argKey => args[argKey].dataType === 'file');
          if (files.length > 0 || args[key].dataType === 'array' && args[key]?.array?.dataType === 'file') {
            return this.validationService.ValidateParam(param, context.files[name] || undefined, name, fieldErrors, undefined, this.minimalSwaggerConfig);
          } else {
            return this.validationService.ValidateParam(param, context.form.get(name), name, fieldErrors, undefined, this.minimalSwaggerConfig);
          }
        }
        case 'res':
          return (statusCode: HttpStatusCodeLiteral, data: ResponseTypes, headers?: Record<string, string | string[] | undefined>) => {
            context.generatedResponse = this.returnHandler({ context, headers: this.removeUndefinedHeaders(headers), statusCode, data, next });
          };
      }
    });
    if (Object.keys(fieldErrors).length > 0) {
      throw new ValidateError(fieldErrors, '');
    }
    return values;
  }

  /**
   * Take a Hono context (app / response context) and convert it to a TSOA template compatible format, 
   * where body, query and form data are resolved and added to the context for access synchronously.
   */
  public async getTsoaCompatContext(ctx: HonoContext): Promise<Context> {
    const compatCtx = ctx as any as Context;
    // Overwrite query function of request
    compatCtx.req.query = this.getQueries(ctx);
    // Add parsed body if any
    compatCtx.req.parsedBody = await this.getBody(compatCtx);
    // Add parsed form data to request if any
    compatCtx.form = await this.parseFormData(compatCtx);
    compatCtx.files = {};
    return compatCtx;
  }

  /**
   * Parse Hono query params and make a map of string or string array
   */
  private getQueries(ctx: HonoContext): Record<string, string | string[]> {
    const values: Record<string, string | string[]> = ctx.req.queries();
    Object.keys(values).forEach((key) => {
      values[key] = (values[key].length === 1) ? values[key][0] : values[key];
    });
    return values;
  }

  /**
   * Parse Hono request body depending on the content type.
   */
  private getBody(ctx: Context): Promise<Record<string, any> | string> {
    const contentType = ctx.req.header('content-type')?.toLowerCase() || '';

    if (contentType.startsWith('application/json')) {
      return ctx.req.json();
    }

    if (contentType.startsWith('application/x-www-form-urlencoded') || contentType.startsWith('multipart/form-data')) {
      return ctx.req.parseBody();
    }

    return ctx.req.text();
  }

  /**
   * Parse Hono requeest data depending on the content type and return any form data as a parsed map.
   */
  private async parseFormData(ctx: Context): Promise<Record<string, any>> {
    const contentType = ctx.req.header('content-type')?.toLowerCase() || '';

    if (contentType.startsWith('application/x-www-form-urlencoded') || contentType.startsWith('multipart/form-data')) {
      return await ctx.req.formData();
    }
    return {};
  }

  /**
   * Parse form data of a Hono request and add any files as a Tsoa compatible files in a record on the context object.
   */
  public async fileUploadMiddleware(next: Next, ctx: Context, fieldnames: Array<{ name: string }>): Promise<void> {
    // Get files from form data
    ctx.form = await ctx.req.formData();
    const formDataArray = [...ctx.form.entries()];
    const fileMap = {} as Record<string, TsoaFile | TsoaFile[]>;

    for (const fileArg of fieldnames) {
      const name = fileArg.name;
      const files = formDataArray.filter(entry => entry[0] === name).map(entry => entry[1]);

      const tsoaFiles = await this.convertFilesToBody(files, name);
      // Convert Deno File to TSOA / Multer compatible body
      tsoaFiles.forEach((file) => {
        const name = file.fieldname;
        const fileEntry = fileMap[name];

        if (fileEntry) {
          (Array.isArray(fileEntry)) ? fileEntry.push(file) : fileMap[name] = [fileEntry, file];
        }
        else {
          fileMap[name] = file;
        }
      });
    };
    ctx.files = fileMap;
    await next();
  }

  /**
   * Convert Hono / Deno Files to TSOA compatible TsoaFiles format.
   */
  private convertFilesToBody(files: File | File[], key: string): Promise<TsoaFile[]> {
    const fileArray: File[] = Array.isArray(files) ? files : [files];
    const tsoaFiles = fileArray.filter(file => Boolean(file)).map(async file => {
      const [mime, encoding] = file.type?.split(";") || ['', ''];

      const tsoaFile: TsoaFile = {
        fieldname: key,
        originalname: file.name,
        mimetype: mime,
        encoding: encoding,
        size: file.size,
        stream: file.stream() as unknown as Readable, // TODO: How to implement Node / Deno compatible stream?
        buffer: bufferToBase64(await file.arrayBuffer()) as unknown as Buffer, // TODO: Types does not match with test that expect a base 64 string...?
        destination: '',
        filename: '',
        path: '',
      };
      return tsoaFile;
    });
    return Promise.all(tsoaFiles);
  }
}
