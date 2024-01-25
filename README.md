<div align="center">
  <a href="https://tsoa-community.github.io/docs/" target="blank">
    <h1>tsoa-deno</h1>
  </a>

OpenAPI-compliant REST APIs using TypeScript and Deno

<span>[![build status](https://github.com/louis-amhild/tsoa-deno/actions/workflows/runTestsOnPush.yml/badge.svg?branch=master)](https://github.com/louis-amhild/tsoa-deno/actions/workflows/runTestsOnPush.yml)</span>
<span>[![npm version](https://img.shields.io/npm/v/tsoa-deno/latest)](https://www.npmjs.com/package/tsoa-deno)</span>
<span>[![build status](https://shield.deno.dev/x/tsoa_runtime)](https://deno.land/x/tsoa_runtime)</span>
</div>

# TSOA for Deno

This repository is dedicated to bringing the power of TSOA (TypeScript OpenAPI) to Deno, with a special focus on enabling TSOA APIs in Supabase Edge Functions. It provides a Deno-compatible version of the TSOA runtime, allowing the use of TSOA controllers in Edge Functions powered by Deno.

:warning: **Warning:** Unfortunately tsoa-deno does not work on Supabase Edge functions at the moment, as support for decorators is currently broken (as of Supabase Edge release v1.34.0). I hope the Supabase bug will soon be resolved (https://github.com/supabase/edge-runtime/issues/296). Meanwhile it still works great on Deno Deploy and other Deno servers.

## About TSOA

TSOA is an open-source framework designed to facilitate building REST APIs in TypeScript by automatically generating Swagger documentation from TypeScript interfaces and decorators. It simplifies API development by reducing boilerplate code and enhancing the TypeScript experience.

## About Hono

Hono is a fast and simple web framework for Deno, inspired by Express and other JavaScript/TypeScript frameworks. It's designed for building efficient and scalable server-side applications, and it's particularly well-suited for Deno environments.

## Features

- **Deno Compatibility**: Offers a Deno-compatible version of the TSOA runtime.
- **Hono Integration**: Includes a modified `hono-router` template for TSOA, facilitating the use with Hono in Deno.

## Getting Started

To start using TSOA with Deno:

1. Install the`tsoa-deno` on the client side to generate routes and spec files (ie. `npm install -g tsoa-deno`).
2. The key difference with `tsoa-deno` compared to the standard TSOA npm package is the inclusion of the `hono-router.hbs` in the resources folder, tailored for Deno and Hono. You can specify 'hono' as middleware in `tsoa.config`.
3. The code example below shows the needed config files for initial setup and usage. A fully functional example is also available in [tsoa-deno-example repo](https://github.com/louis-amhild/tsoa-deno-example). 

For comprehensive guidance on building APIs with TSOA, refer to the [original TSOA guide](https://tsoa-community.github.io/docs/getting-started.html) and the [TSOA GitHub repository](https://github.com/lukeautry/tsoa).

## Code Examples

See [tsoa-deno-example repo](https://github.com/louis-amhild/tsoa-deno-example) for a complete code example.

### TSOA Configuration

The only tsoa-deno specific setting of the config (compared to vanilla tsoa), is the middleware which must be 'hono'. This will ensure that tsoa-deno generates Deno/Supabase Edge functions compatible routes.ts code.

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
        "middleware": "hono"
    }
}
```

### Deno Configuration

It is important to set `experimentalDecorators` to true in the deno.config, as of Deno 1.40 this setting is set to false as default.

Filename: `functions/deno.json`

```json
{
    "compilerOptions": {
        "experimentalDecorators": true,
        "emitDecoratorMetadata": false,
        "lib": ["esnext", "dom"]
    },
    "importMap": "./import_map.json",
    "include": [
        "./**/*.ts"
    ]
}
```

### Import Map

In order for the library to work, two mappings are required in the import map: @hono and @tsoa-deno/runtime.

:information_source: **Supabase:** In Supabase Edge functions, the import map has to be called "import_map.json" and be placed in the root or in the function root, [Supabase import map docs](https://supabase.com/docs/guides/functions/import-maps#using-import-maps). Supabase does not currently allow a custom deno.json configuration, so in Supabase deno.json will be ignored.

Filename: `functions/import_map.json`

```json
{
    "imports": {
        "@hono": "https://deno.land/x/hono@v3.7.6/mod.ts",
        "@tsoa-deno/runtime": "https://deno.land/x/tsoa_runtime@v6.1.5.0/mod.ts"
    }
}
```

### Setting Up a TSOA Endpoint with Hono

In the functions index file we get the routes defined in the shared folder (generated with `tsoa-deno routes`) and register them in the hono router.

Filename: `functions/tsoa/index.ts`

```typescript
/// <reference lib="deno.ns" />
// Get TSOA controller routes for this endpoint
import * as routes from '../_shared/routes.ts';

import { Hono } from '@hono';

const app = new Hono();
// Register routes
routes.RegisterRoutes(app);
Deno.serve(app.fetch);
```

### TSOA Controller Example

The controller syntax is the same as in vanilla TSOA.

:information_source: **Supabase:** In Supabase Edge functions the route (ie. `@Route('/tsoa')`) has to correspond/be equal to the actual path of the Edge function.

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

### Package script helpers

Here are some useful npm scripts to watch for changes, generate the TSOA routes and start a local Deno dev server.

Filename: `functions/package.json`
```json
    ...
    "scripts": {
        "start": "npm run watch",
        "build": "tsoa-deno routes",
        "serve": "npm run build && deno run --watch --allow-net --config deno.json example/index.ts",
        "watch": "concurrently --names \"TSOA,DENO\" \"nodemon -x tsoa-deno spec-and-routes -e ts,js,mjs,cjs,json --ignore **/routes.ts --ignore **/swagger.json\" \"npm run serve\"",
        "test": "deno test --allow-net --quiet --config deno.json"
    },
    ...
```

## Contributing

This Deno port of tsoa-runtime is currently in a testing phase to gauge its suitability and acceptance among Deno developers. Contributions, feedback, and reports on usage experiences are highly welcomed and appreciated. We envision this project potentially becoming part of the mainstream TSOA release in the future. Please refer to the main repository for guidelines on contributing.
