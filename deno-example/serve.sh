#!/usr/bin/env sh
tsoa routes
deno run --allow-net --import-map=import_map.json --config deno.json example/index.ts
