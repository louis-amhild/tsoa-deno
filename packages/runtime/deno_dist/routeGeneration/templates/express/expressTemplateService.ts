import { Request as ExRequest, Response as ExResponse, NextFunction as ExNext } from 'npm:express@4.18.3';

import { Controller } from '../../../interfaces/controller.ts';
import { FieldErrors } from '../../templateHelpers.ts';
import { TsoaRoute } from '../../tsoa-route.ts';
import { ValidateError } from '../../templateHelpers.ts';
import { TemplateService } from '../templateService.ts';

type ExpressApiHandlerParameters = {
  methodName: string;
  controller: Controller | Object;
  response: ExResponse;
  next: ExNext;
  validatedArgs: any[];
  successStatus?: number;
};

type ExpressValidationArgsParameters = {
  args: Record<string, TsoaRoute.ParameterSchema>;
  request: ExRequest;
  response: ExResponse;
};

type ExpressReturnHandlerParameters = {
  response: ExResponse;
  headers: any;
  statusCode?: number;
  data?: any;
};

export class ExpressTemplateService extends TemplateService<ExpressApiHandlerParameters, ExpressValidationArgsParameters, ExpressReturnHandlerParameters> {
  async apiHandler(params: ExpressApiHandlerParameters) {
    const { methodName, controller, response, validatedArgs, successStatus, next } = params;
    const promise = this.buildPromise(methodName, controller, validatedArgs);

    try {
      const data = await Promise.resolve(promise);
      let statusCode = successStatus;
      let headers;
      if (this.isController(controller)) {
        headers = controller.getHeaders();
        statusCode = controller.getStatus() || statusCode;
      }

      this.returnHandler({ response, headers, statusCode, data });
    } catch (error) {
      return next(error);
    }
  }

  getValidatedArgs(params: ExpressValidationArgsParameters): any[] {
    const { args, request, response } = params;

    const fieldErrors: FieldErrors = {};
    const values = Object.values(args).map(param => {
      const name = param.name;
      switch (param.in) {
        case 'request':
          return request;
        case 'request-prop': {
          const descriptor = Object.getOwnPropertyDescriptor(request, name);
          const value = descriptor ? descriptor.value : undefined;
          return this.validationService.ValidateParam(param, value, name, fieldErrors, false, undefined);
        }
        case 'query':
          return this.validationService.ValidateParam(param, request.query[name], name, fieldErrors, false, undefined);
        case 'queries':
          return this.validationService.ValidateParam(param, request.query, name, fieldErrors, false, undefined);
        case 'path':
          return this.validationService.ValidateParam(param, request.params[name], name, fieldErrors, false, undefined);
        case 'header':
          return this.validationService.ValidateParam(param, request.header(name), name, fieldErrors, false, undefined);
        case 'body':
          return this.validationService.ValidateParam(param, request.body, name, fieldErrors, true, undefined);
        case 'body-prop':
          return this.validationService.ValidateParam(param, request.body[name], name, fieldErrors, true, 'body.');
        case 'formData': {
          const files = Object.values(args).filter(param => param.dataType === 'file');
          if (param.dataType === 'file' && files.length > 0) {
            const requestFiles = request.files as { [fileName: string]: Express.Multer.File[] };
            if (requestFiles[name] === undefined) {
              return undefined;
            }

            const fileArgs = this.validationService.ValidateParam(param, requestFiles[name], name, fieldErrors, false, undefined);
            return fileArgs.length === 1 ? fileArgs[0] : fileArgs;
          } else if (param.dataType === 'array' && param.array && param.array.dataType === 'file') {
            return this.validationService.ValidateParam(param, request.files, name, fieldErrors, false, undefined);
          }
          return this.validationService.ValidateParam(param, request.body[name], name, fieldErrors, false, undefined);
        }
        case 'res':
          return (status: number | undefined, data: any, headers: any) => {
            this.returnHandler({ response, headers, statusCode: status, data });
          };
      }
    });

    if (Object.keys(fieldErrors).length > 0) {
      throw new ValidateError(fieldErrors, '');
    }
    return values;
  }

  protected returnHandler(params: ExpressReturnHandlerParameters) {
    const { response, statusCode, data } = params;
    let { headers } = params;
    headers = headers || {};

    if (response.headersSent) {
      return;
    }
    Object.keys(headers).forEach((name: string) => {
      response.set(name, headers[name]);
    });
    if (data && typeof data.pipe === 'function' && data.readable && typeof data._read === 'function') {
      response.status(statusCode || 200);
      data.pipe(response);
    } else if (data !== null && data !== undefined) {
      response.status(statusCode || 200).json(data);
    } else {
      response.status(statusCode || 204).end();
    }
  }
}