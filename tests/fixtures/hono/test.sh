#!/usr/bin/env sh
# Shortcut helper script for fast test and debugging of hono template changes

# Link honoTemplateService source to deno_dist to avoid rebuilding deno_dist on every change
# 0. ln packages/cli/src/routeGeneration/templates/hono/honoTemplateService.ts packages/runtime/deno_dist/routeGeneration/hono/honoTemplateService.ts

# 1. Copy Hono template definition to runtime cli
cp -R ../../../packages/cli/src/routeGeneration/templates/hono ../../../packages/cli/dist/routeGeneration/templates

# 2. Generate routes.ts
yarn prepare-test:hono

# 3. Run tests
yarn test:deno
