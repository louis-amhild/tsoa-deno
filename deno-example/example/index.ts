// Get TSOA controller routes for this endpoint
import * as routes from "../_shared/routes.ts";

import { Hono } from 'https://deno.land/x/hono/mod.ts';
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";


import { assertEquals } from "https://deno.land/std/assert/assert_equals.ts";
import { delay } from "https://deno.land/std/async/delay.ts";

const x = 1 + 2;
assertEquals(x, 3);

const app = new Hono();
// Register routes
routes.RegisterRoutes(app);
serve(app.fetch);
