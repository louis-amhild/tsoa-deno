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
  }
  // The replacer should return undefined when we want to let denoify replace the statement
  return undefined;
});