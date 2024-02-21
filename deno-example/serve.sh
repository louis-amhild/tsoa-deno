#!/usr/bin/env sh
tsoa routes
deno run --allow-net --import-map=import_map.json --config tsconfig.json example/index.ts
