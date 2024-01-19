/**
 * Denoify config
 */

const config = {
  ports: {
    buffer: 'https://deno.land/x/node_buffer/mod.ts',
    stream: 'https://deno.land/x/readable_stream/mod.ts',
    validator: 'https://deno.land/x/deno_validator/mod.ts',
  },
  replacer: '../../denoify.replacer.mjs',
};

module.exports = config;
