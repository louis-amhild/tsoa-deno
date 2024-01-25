<div align="center">
  <a href="https://tsoa-community.github.io/docs/" target="blank">
    <h1>TSOA</h1>
  </a>

OpenAPI-compliant REST APIs using TypeScript and Deno

<span>[![build status](https://github.com/louis-amhild/tsoa-deno/actions/workflows/runTestsOnPush.yml/badge.svg?branch=master)](https://github.com/louis-amhild/tsoa-deno/actions/workflows/runTestsOnPush.yml)</span>
<span>[![build status](https://shield.deno.dev/x/tsoa_runtime)](https://deno.land/x/tsoa_runtime)</span>
</div>

# TSOA for Deno

This repository is dedicated to bringing the power of TSOA (TypeScript OpenAPI) to Deno, with a special focus on enabling TSOA APIs in Supabase Edge Functions. It provides a Deno-compatible version of the TSOA runtime, allowing the use of TSOA controllers in Edge Functions powered by Deno.

## About TSOA

TSOA is an open-source framework designed to facilitate building REST APIs in TypeScript by automatically generating Swagger documentation from TypeScript interfaces and decorators. It simplifies API development by reducing boilerplate code and enhancing the TypeScript experience.

## About Hono

Hono is a fast and simple web framework for Deno, inspired by Express and other JavaScript/TypeScript frameworks. It's designed for building efficient and scalable server-side applications, and it's particularly well-suited for Deno environments.

## Features

- **Deno Compatibility**: Offers a Deno-compatible version of the TSOA runtime.
- **Hono Integration**: Includes a modified `hono-router` template for TSOA, facilitating the use with Hono on Deno.
- **Automatic Conversion and Release**: Features CI workflows for automatic conversion ("Denoification") of new TSOA library versions, ensuring up-to-date releases on [Deno Land](https://deno.land/x/tsoa_runtime).

## Getting Started

To start using TSOA with Deno:

1. Install the TSOA CLI or `tsoa-deno` on the client side to generate routes and spec files.
2. The key difference with `tsoa-deno` compared to the standard TSOA npm package is the inclusion of the `hono-router.hbs` in the resources folder, tailored for Deno and Hono.
3. Follow the code examples provided in this documentation for initial setup and usage.

For comprehensive guidance on building APIs with TSOA, refer to the [original TSOA guide](https://tsoa-community.github.io/docs/getting-started.html) and the [TSOA GitHub repository](https://github.com/lukeautry/tsoa).

## Code Examples

### Setting Up a TSOA Endpoint with Hono

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

### TSOA Controller Example

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

### TSOA Configuration Example

Filename: `functions/tsoa.json`

```json
{
    "entryFile": "tsoa.index.ts",
    "noImplicitAdditionalProperties": "throw-on-extras",
    "controllerPathGlobs": [
        "**/*-controller.ts"
    ],
    "spec": {
        "outputDirectory": "api-specs",
        "specVersion": 3    
    },
    "routes": {
        "routesDir": "./_shared",
        "middlewareTemplate": "../node_modules/tsoa-hono/hono-router.hbs"
    }
}
```

## Contributing

This Deno port of tsoa-runtime is currently in a testing phase to gauge its suitability and acceptance among Deno developers. Contributions, feedback, and reports on usage experiences are highly welcomed and appreciated. We envision this project potentially becoming part of the mainstream TSOA release in the future. Please refer to the main repository for guidelines on contributing.
