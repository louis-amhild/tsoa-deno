import { Request as HRequest, ResponseToolkit as HResponse } from '@hapi/hapi';
import { type Payload } from '@hapi/boom';
import { Controller, FieldErrors, TsoaRoute, ValidateError } from '@tsoa-deno/runtime';

import { TemplateService } from '../templateService';

const hapiTsoaResponsed = Symbol('@tsoa:template_service:hapi:responsed');

type HapiApiHandlerParameters = {
  methodName: string;
  controller: Controller | Object;
  h: HResponse;
  validatedArgs: any[];
  successStatus?: number;
};

type HapiValidationArgsParameters = {
  args: Record<string, TsoaRoute.ParameterSchema>;
  request: HRequest;
  h: HResponse;
};

type HapiReturnHandlerParameters = {
  h: HResponse;
  headers: any;
  statusCode?: number;
  data?: any
};

export class HapiTemplateService extends TemplateService<HapiApiHandlerParameters, HapiValidationArgsParameters, HapiReturnHandlerParameters> {
  constructor(
    readonly models: any,
    private readonly minimalSwaggerConfig: any,
  ) {
    super(models);
  }

  async apiHandler(params: HapiApiHandlerParameters) {
    const { methodName, controller, h, validatedArgs, successStatus } = params;
    const promise = this.buildPromise(methodName, controller, validatedArgs);

    try {
      const data = await Promise.resolve(promise);
      let statusCode = successStatus;
      let headers;

      if (this.isController(controller)) {
        headers = controller.getHeaders();
        statusCode = controller.getStatus() || statusCode;
      }
      return this.returnHandler({ h, headers, statusCode, data });
    } catch (error: any) {

      const { boomify, isBoom } = await import('@hapi/boom');
      if (isBoom(error)) {
        throw error;
      }

      const boomErr = boomify(error instanceof Error ? error : new Error(error.message));
      boomErr.output.statusCode = error.status || 500;
      boomErr.output.payload = {
        name: error.name,
        message: error.message,
      } as unknown as Payload;
      throw boomErr;
    }
  }

  getValidatedArgs(params: HapiValidationArgsParameters): any[] {
    const { args, request, h } = params;

    const errorFields: FieldErrors = {};
    const values = Object.values(args).map(param => {
      const name = param.name;
      switch (param.in) {
        case 'request':
          return request;
        case 'request-prop': {
          const descriptor = Object.getOwnPropertyDescriptor(request, name);
          const value = descriptor ? descriptor.value : undefined;
          return this.validationService.ValidateParam(param, value, name, errorFields, undefined, this.minimalSwaggerConfig);
        }
        case 'query':
          return this.validationService.ValidateParam(param, request.query[name], name, errorFields, undefined, this.minimalSwaggerConfig);
        case 'queries':
          return this.validationService.ValidateParam(param, request.query, name, errorFields, undefined, this.minimalSwaggerConfig);
        case 'path':
          return this.validationService.ValidateParam(param, request.params[name], name, errorFields, undefined, this.minimalSwaggerConfig);
        case 'header':
          return this.validationService.ValidateParam(param, request.headers[name], name, errorFields, undefined, this.minimalSwaggerConfig);
        case 'body':
          return this.validationService.ValidateParam(param, request.payload, name, errorFields, undefined, this.minimalSwaggerConfig);
        case 'body-prop': {
          const descriptor = Object.getOwnPropertyDescriptor(request.payload, name);
          const value = descriptor ? descriptor.value : undefined;
          return this.validationService.ValidateParam(param, value, name, errorFields, 'body.', this.minimalSwaggerConfig);
        }
        case 'formData': {
          const descriptor = Object.getOwnPropertyDescriptor(request.payload, name);
          const value = descriptor ? descriptor.value : undefined;
          return this.validationService.ValidateParam(param, value, name, errorFields, undefined, this.minimalSwaggerConfig);
        }
        case 'res':
          return (status: number | undefined, data: any, headers: any) => {
            this.returnHandler({ h, headers, statusCode: status, data });
          };
      }
    });
    if (Object.keys(errorFields).length > 0) {
      throw new ValidateError(errorFields, '');
    }
    return values;
  }

  protected returnHandler(params: HapiReturnHandlerParameters) {
    const { h, statusCode, data } = params;
    let { headers } = params;
    headers = headers || {};

    const tsoaResponsed = Object.getOwnPropertyDescriptor(h, hapiTsoaResponsed);
    if (tsoaResponsed) {
      return tsoaResponsed.value;
    }

    const response = data !== null && data !== undefined ? h.response(data).code(200) : h.response('').code(204);

    Object.keys(headers).forEach((name: string) => {
      response.header(name, headers[name]);
    });

    if (statusCode) {
      response.code(statusCode);
    }

    Object.defineProperty(h, hapiTsoaResponsed, {
      value: response,
      writable: false,
    });

    return response;
  }
}
