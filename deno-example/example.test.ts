import { superdeno as request, IResponse, SuperDeno, Test } from 'https://deno.land/x/superdeno@4.9.0/mod.ts';

// Get TSOA controller routes for this endpoint
import { RegisterRoutes } from './_shared/routes.ts';
import { Hono } from '@hono';

import { expect } from 'npm:chai';

const app = new Hono();
// Register routes
RegisterRoutes(app);

// const server = Deno.serve(app.fetch);
const server = app.fetch;

type SuperTest<T> = SuperDeno;

Deno.test( "Hello Deno Test", () => {
    console.log("Hello world");
})

Deno.test('can request example root', () => {
    return verifyGetRequest("/example", (_err, res) => {
      expect(1).to.equal(1);
    });
  });
  


function verifyGetRequest(path: string, verifyResponse: (err: any, res: IResponse) => any, expectedStatus?: number) {
    return verifyRequest(verifyResponse, request => request.get(path), expectedStatus);
  }
  
  function verifyPostRequest(path: string, data: any, verifyResponse: (err: any, res: IResponse) => any, expectedStatus?: number) {
    return verifyRequest(verifyResponse, request => request.post(path).send(data), expectedStatus);
  }
  
  function verifyRequest(verifyResponse: (err: any, res: IResponse) => any, methodOperation: (request: SuperTest<any>) => Test, expectedStatus = 200) {
    return new Promise<void>((resolve, reject) => {
  
      methodOperation(request(server))
        .expect(expectedStatus)
        .end((err: any, res: IResponse) => {
          let parsedError: any;
          try {
            // Try to parse error response as JSON
            parsedError = res.error === false ? false : JSON.parse(res.text);
          } catch (err) {
            // Use non JSON error response
            parsedError = { text: res.text, statusText: res.statusText };
          }
  
          if (err) {
            reject({
              error: err?.message,
              response: parsedError,
            });
            return;
          }
          // Add this extra text version of the error to be compatible with the other deno tests
          if (parsedError && !parsedError.text) parsedError.text = res.text;
          verifyResponse(parsedError, res);
          resolve();
        });
    });
  }
  