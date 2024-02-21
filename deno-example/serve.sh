#!/usr/bin/env sh
tsoa routes
deno run --import-map=import_map.json --config tsconfig.json example/index.ts