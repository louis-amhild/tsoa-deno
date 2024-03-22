import { Controller, Get, Response, Route } from '@tsoa-deno/runtime';

@Route('IncorrectResponseHeader')
@Response<null, any>(200)
export class IncorrectResponseHeaderController extends Controller {
  @Get()
  public async handler(): Promise<void> {
    return;
  }
}
