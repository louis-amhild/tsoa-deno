// OBS: Unfortunately we can not import controllers with .ts extension as TS 4.9.5 test / eslint will fail when ts allowed flag is set
import '../controllers/rootController';
import '../controllers/optionsController';
import '../controllers/deleteController';
import '../controllers/getController';
import '../controllers/headController';
import '../controllers/patchController';
import '../controllers/postController';
import '../controllers/putController';

import '../controllers/methodController';
import '../controllers/parameterController';
import '../controllers/securityController';
import '../controllers/testController';
import '../controllers/validateController';
import '../controllers/noExtendsController';

// Get TSOA controller routes for this endpoint
import { RegisterRoutes } from './routesNoAdditional';

import { Hono } from '@hono';

const app = new Hono();
// Register routes
RegisterRoutes(app);

// const server = Deno.serve(app.fetch);
export const server = app.fetch;
