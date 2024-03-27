import { Controller } from '../../interfaces/controller.ts';
import { TsoaRoute } from '../tsoa-route.ts';
import { ValidationService } from '../templateHelpers.ts';
import { AdditionalProps } from '../additionalProps.ts';

export abstract class TemplateService<ApiHandlerParameters, ValidationArgsParameters, ReturnHandlerParameters> {
  protected validationService: ValidationService;

  constructor(
    protected readonly models: TsoaRoute.Models,
    protected readonly config: AdditionalProps,
  ) {
    this.validationService = new ValidationService(models, config);
  }

  abstract apiHandler(params: ApiHandlerParameters): Promise<any>;

  abstract getValidatedArgs(params: ValidationArgsParameters): any[];

  protected abstract returnHandler(params: ReturnHandlerParameters): any;

  protected isController(object: Controller | Object): object is Controller {
    return 'getHeaders' in object && 'getStatus' in object && 'setStatus' in object;
  }

  protected buildPromise(methodName: string, controller: Controller | Object, validatedArgs: any) {
    const prototype = Object.getPrototypeOf(controller);
    const descriptor = Object.getOwnPropertyDescriptor(prototype, methodName);
    return descriptor!.value.apply(controller, validatedArgs);
  }
}
