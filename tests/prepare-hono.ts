/* eslint-disable no-console */
import { dim, green } from 'chalk';
import { generateSpecAndRoutes, generateRoutes } from '../packages/cli';
import { Timer } from './utils/timer';

const spec = async () => {
  const result = await generateSpecAndRoutes({
    configuration: 'tsoa.json',
  });
  return result;
};

const log = async <T>(label: string, fn: () => Promise<T>) => {
  console.log(dim(green(`↻ Starting ${label}...`)));
  const timer = new Timer();

  const result = await fn();
  console.log(green(`✓ Finished ${label} in ${timer.elapsed()}ms`));

  return result;
};

(async () => {
  const metadata = await log('Swagger Spec Generation', spec);

  await Promise.all([
    log('Hono Route Generation', () =>
      generateRoutes({
        noImplicitAdditionalProperties: 'silently-remove-extras',
        authenticationModule: './fixtures/hono/authentication.ts',
        basePath: '/v1',
        entryFile: './fixtures/hono/server.ts',
        middleware: 'hono',
        routesDir: './fixtures/hono',
      }),
    ),
    log('Hono Route Generation (but noImplicitAdditionalProperties is set to "throw-on-extras")', () =>
      generateRoutes({
        noImplicitAdditionalProperties: 'throw-on-extras',
        authenticationModule: './fixtures/hono/authentication.ts',
        basePath: '/v1',
        entryFile: './fixtures/hono/serverNoAdditional.ts',
        middleware: 'hono',
        routesDir: './fixtures/hono',
        routesFileName: 'routesNoAdditional.ts',
      }),
    ),
  ]);
})();
