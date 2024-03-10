// Get TSOA controller routes for this endpoint
import * as routes from '../_shared/routes.ts';

import { Hono } from '@hono';

const app = new Hono();
// Register routes
routes.RegisterRoutes(app);
Deno.serve(app.fetch);
