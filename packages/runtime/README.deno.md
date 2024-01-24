
# TSOA Runtime for Deno

This library is the Deno port of the `TSOA Runtime`, part of the TSOA framework. Originally designed for Node.js, this port enables Deno developers to utilize the runtime aspect of TSOA. Routes and specifications are generated via the TSOA command line tool, similar to its Node.js counterpart. The port was made possible using the `denoify` script, allowing for compatibility with Deno packages.

:warning: **Warning:** Unfortunately tsoa-deno does not work on Supabase Edge functions at the moment, as support for decorators is currently broken (as of Supabase Edge release v1.34.0). I hope the Supabase bug will soon be resolved (https://github.com/supabase/edge-runtime/issues/296). Meanwhile it still works great on Deno Deploy and other Deno servers.

## About TSOA

TSOA is an open-source framework that facilitates building REST APIs in TypeScript. It provides tools for automatically generating Swagger documentation based on TypeScript interfaces and decorators. TSOA aims to simplify the development process by reducing boilerplate code and enhancing the overall TypeScript experience in API development.

## Features

- Enables TSOA Runtime in Deno, including compatibility with Supabase functions.
- Familiar TSOA usage patterns for Node.js developers, now available in Deno.
- Direct integration with existing TSOA projects and workflows.

## Installation

This package can be imported directly into your Deno project from [Deno Land](https://deno.land/x/tsoa_runtime).

## Usage

Use `TSOA Runtime` in Deno as you would in a Node.js environment, with the added step of registering the tsoa controller using Hono (please refer to the [main repository](https://github.com/louis-amhild/tsoa-deno) to see how to do this). Below is a simple usage example of how to use the runtime library in Deno (ie. Supabase Functions):

Filename: `functions/tsoa/index.ts`
```typescript
// Get TSOA controller routes for this endpoint
import * as routes from "../_shared/routes.ts";

import { Hono } from 'https://deno.land/x/hono@v3.7.6/mod.ts';
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const app = new Hono();
// Register routes
routes.RegisterRoutes(app);
serve(app.fetch);
```

Filename: `functions/tsoa/tsoa-controller.ts`
```typescript
import { Route, Body, Post, Controller } from 'tsoa_runtime';

@Route('/tsoa')
export class TsoaController extends Controller {
    /**
    * A simple TSOA endpoint test
    */
    @Post('test')
    public async test(@Body() body: { input: string }): Promise<{ outputMatrix: number[] }> {
        const outputMatrix = [1, 10, 4, 7];
        return { outputMatrix };
    }
}
```

For more detailed examples and advanced usage, please refer to the [main repository](https://github.com/louis-amhild/tsoa-deno).

## Contributing

This Deno port of `TSOA Runtime` is currently in a testing phase to gauge its suitability and acceptance among Deno developers. Contributions, feedback, and reports on usage experiences are highly welcomed and appreciated. We envision this project potentially becoming part of the mainstream TSOA release in the future. Please refer to the main repository for guidelines on contributing.
