import { Controller, Middlewares as GenericMiddlewares, Get, Route } from '@tsoa-deno/runtime';

import type { NextFunction, Request, RequestHandler, Response } from 'express';

function Middlewares(...mws: Array<RequestHandler | (() => Promise<RequestHandler>)>) {
  return GenericMiddlewares(...mws);
}

const middlewaresState: string[] = [];

export function state(): string[] {
  return middlewaresState;
}

function testMiddleware(key: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    middlewaresState.push(key);
    next();
  };
}

// base class with some middleware
@Middlewares(testMiddleware('base'))
class BaseController extends Controller {}

// another one
@Middlewares(testMiddleware('intermediate'))
class IntermediateController extends BaseController {}

// intermediate controller class without middlewares
class NoopController extends IntermediateController {}

@GenericMiddlewares<RequestHandler>(testMiddleware('route'))
@Route('MiddlewareHierarchyTestExpress')
export class MiddlewareHierarchyTestExpress extends NoopController {
  @Middlewares(testMiddleware('test1'), testMiddleware('test2'))
  @Get('/test1')
  public async test1(): Promise<void> {
    return;
  }
}
