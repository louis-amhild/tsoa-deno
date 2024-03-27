import { Middlewares as GenericMiddlewares, Get, Route } from '@tsoa-deno/runtime';

import type { Request, ResponseToolkit, RouteOptionsPreAllOptions } from '@hapi/hapi';

function Middlewares(...mws: RouteOptionsPreAllOptions[]) {
  return GenericMiddlewares<RouteOptionsPreAllOptions>(...mws);
}

const middlewaresState: Record<string, boolean> = {};

export function stateOf(key: string): boolean | undefined {
  return middlewaresState[key];
}

function testMiddleware(key: string) {
  return async (request: Request, h: ResponseToolkit) => {
    middlewaresState[key] = true;
    return key;
  };
}

@GenericMiddlewares<RouteOptionsPreAllOptions>(testMiddleware('route'))
@Route('MiddlewareTestHapi')
export class MiddlewareHapiController {
  @Middlewares(testMiddleware('test1'), testMiddleware('test2'))
  @Get('/test1')
  public async test1(): Promise<void> {
    return;
  }
}
