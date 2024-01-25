<div align="center">
  <a href="https://tsoa-community.github.io/docs/" target="blank">
    <h1>tsoa-deno</h1>
  </a>

OpenAPI-compliant REST APIs using TypeScript and Deno / Node

<span>[![build status](https://github.com/louis-amhild/tsoa-deno/actions/workflows/runTestsOnPush.yml/badge.svg?branch=master)](https://github.com/louis-amhild/tsoa-deno/actions/workflows/runTestsOnPush.yml)</span>
<span>[![npm version](https://img.shields.io/npm/v/tsoa-deno/latest)](https://www.npmjs.com/package/tsoa-deno)</span>
<span>[![build status](https://shield.deno.dev/x/tsoa_runtime)](https://deno.land/x/tsoa_runtime)</span>

</div>

## About
This enhanced fork of TSOA extends the framework's capabilities to Deno, facilitating the development of RESTful applications. The primary motivation behind this adaptation is to harness TSOA's robust features within the great Supabase Edge Functions, however it should work with other Deno-based setups as well.

To accomplish this, the fork introduces compatibility with the Hono framework through modifications to the TSOA CLI, along with a Deno-compliant version of the TSOA Runtime package. These enhancements ensure seamless integration and operation within the Deno ecosystem.

For detailed Deno specific usage instructions and code examples, please visit the [tsoa-deno github](repository https://github.com/louis-amhild/tsoa-deno) repository. Additionally, refer to the TSOA documentation for standard TSOA setup and implementation instructions.

## Goal

- TypeScript controllers and models as the single source of truth for your API
- A valid OpenAPI (formerly Swagger) spec (2.0 or 3.0 if you choose 😍) is generated from your controllers and models, including:
  - Paths (e.g. GET /users)
  - Definitions based on TypeScript interfaces (models)
  - Parameters/model properties marked as required or optional based on TypeScript (e.g. myProperty?: string is optional in the OpenAPI spec)
  - jsDoc supported for object descriptions (most other metadata can be inferred from TypeScript types)
- Routes are generated for middleware of choice
  - Express, Hapi, and Koa currently supported, other middleware can be supported using a simple handlebars template
  - Validate request payloads

## Philosophy

- Rely on TypeScript type annotations to generate API metadata if possible
- If regular type annotations aren't an appropriate way to express metadata, use decorators
- Use jsdoc for pure text metadata (e.g. endpoint descriptions)
- Minimize boilerplate
- Models are best represented by interfaces (pure data structures), but can also be represented by classes
- Runtime validation of tsoa should behave as closely as possible to the specifications that the generated OpenAPI 2/3 schema describes. Any differences in validation logic are clarified by logging warnings during the generation of the OpenAPI Specification (OAS) and/or the routes.
  - Please note that by enabling OpenAPI 3 you minimize the chances of divergent validation logic since OpenAPI 3 has a more expressive schema syntax.

## Getting Started

- [Documentation](https://tsoa-community.github.io/docs/)
- [API Reference](https://tsoa-community.github.io/reference/)
- [Getting started guide](https://tsoa-community.github.io/docs/getting-started)

## Examples

Check out the [guides](https://tsoa-community.github.io/docs/getting-started)

See example controllers in [the tests](tests/fixtures/controllers)

See example models in [the tests](tests/fixtures/testModel.ts)

## Help wanted

### Contributing code

To contribute (via a PR), please first see the [Contributing Guide](https://github.com/lukeautry/tsoa/tree/master/docs/CONTRIBUTING.md)

### Becoming a maintainer

tsoa wants additional maintainers! The library has increased in popularity and has quite a lot of pull requests and issues. [Please post in this issue](https://github.com/lukeautry/tsoa/issues/236) if you're willing to take on the role of a maintainer.
