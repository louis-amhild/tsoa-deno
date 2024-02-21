#!/usr/bin/env sh

# 1. Copy Hono template definition to runtime cli 
cp -R /Users/louis/tsoa-deno/packages/cli/src/routeGeneration/templates/hono /Users/louis/tsoa-deno/packages/cli/dist/routeGeneration/templates

# 2. Generate routes.ts (cd ~/tsoa-deno/tests$)
npm run prepare-test:hono 

# 3. Run tests  (~/tsoa-deno/tests/fixtures/hono )
deno test --allow-net --quiet  --import-map=import_map.json --config tsconfig.json  --allow-env  --allow-read --unstable-sloppy-imports
