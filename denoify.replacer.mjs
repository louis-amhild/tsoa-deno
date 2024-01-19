// @denoify-ignore
import { makeThisModuleAnExecutableReplacer } from "denoify";
import { assert } from "tsafe";

makeThisModuleAnExecutableReplacer(async ({
  parsedImportExportStatement,
  destDirPath
}) => {

  switch (parsedImportExportStatement.parsedArgument.nodeModuleName) {
    case "multer": {
      // Only replace multer imports defining MulterOpts
      if (!parsedImportExportStatement.target?.includes("MulterOpts")) return undefined;
      // We expect not to run against statements like: import(..).then(...)
      assert(!parsedImportExportStatement.isAsyncImport);
      // Define the MulterOpts dummy type
      return `// Multer is not currently support by Deno runtime, so define this dummy type\ntype MulterOpts = {}`;
    };
    case "@hapi/hapi": {
      // We expect not to run against statements like: import(..).then(...)
      assert(!parsedImportExportStatement.isAsyncImport);
      // Define the hapi dummy type
      return `// Hapi is not support by Deno runtime, so define this dummy type\ntype HRequest = {};\ntype HResponse = {};\n`;
    };
    case "@hapi/boom": {
      // We expect not to run against statements like: import(..).then(...)
      assert(!parsedImportExportStatement.isAsyncImport);
      // Define the hapi dummy type
      return `// Hapi is not support by Deno runtime, so define this dummy type\ntype Payload = {};\n`;
    };
    case "validator": {
      // Only replace multer imports defining MulterOpts
      if (!parsedImportExportStatement.target?.includes("validator")) return undefined;
      // We expect not to run against statements like: import(..).then(...)
      assert(!parsedImportExportStatement.isAsyncImport);
      return "import * as validator from 'https://deno.land/x/deno_validator@v0.0.5/mod.ts'";
    }
    case "reflect-metadata": {
      // We expect not to run against statements like: import(..).then(...)
      assert(!parsedImportExportStatement.isAsyncImport);
      return "import 'npm:reflect-metadata'";
    }
    case "@hono": {
      const { target } = parsedImportExportStatement;
      // We expect not to run against statements like: import(..).then(...)
      assert(!parsedImportExportStatement.isAsyncImport);
      return `import ${target} from '@hono'`;
    }
    case "@tsoa-deno/runtime": {
      const { target } = parsedImportExportStatement;
      // We expect not to run against statements like: import(..).then(...)
      assert(!parsedImportExportStatement.isAsyncImport);
      return `import ${target} from '@tsoa-deno/runtime'`;
    }
  }
  // The replacer should return undefined when we want to let denoify replace the statement
  return undefined;
});
