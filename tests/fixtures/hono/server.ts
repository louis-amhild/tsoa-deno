import '../controllers/rootController.ts';
import '../controllers/optionsController.ts';
import '../controllers/deleteController.ts';
import '../controllers/getController.ts';
import '../controllers/headController.ts';
import '../controllers/patchController.ts';
import '../controllers/postController.ts';
import '../controllers/putController.ts';

import '../controllers/methodController.ts';
import '../controllers/mediaTypeController.ts';
import '../controllers/parameterController.ts';
import '../controllers/securityController.ts';
import '../controllers/testController.ts';
import '../controllers/validateController.ts';
import '../controllers/noExtendsController.ts';
import '../controllers/subresourceController.ts';

// Get TSOA controller routes for this endpoint
// import * as routes from './routes.ts';
import { RegisterRoutes } from './routes.ts';

import { Hono } from '@hono';

const app = new Hono();
// Register routes
RegisterRoutes(app);

// const server = Deno.serve(app.fetch);
export const server = app.fetch;