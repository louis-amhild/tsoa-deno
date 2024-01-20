/**
 * Copy template services from tsoa/cli to Deno dist tsoa/runtime package
 */
const path = require('path');
const fs = require('fs');
const templatesDir = './../cli/src/routeGeneration/templates';
const targetDir = './deno_dist/routeGeneration';
const indexTsPath = './deno_dist/index.ts';

const DenoTemplateServices = [
    'templateService.ts',
    'hono/honoTemplateService.ts',
]

// Copy service files and add export statements to package index
function copyAndAddExports() {
    let exportStatements = '// Dynamically added template services from tsoa/cli to Deno tsoa/runtime\n';
    
    DenoTemplateServices.forEach((file) => {
        const sourcePath = path.join(templatesDir, file);
        const targetPath = path.join(targetDir, file);
        // Ensure target directory exists
        fs.mkdirSync(path.dirname(targetPath), { recursive: true });
        fs.copyFileSync(sourcePath, targetPath);
        exportStatements += `export * from './routeGeneration/${file}';\n`;
    });

    // Append export statements to deno_dist/index.ts
    fs.appendFileSync(indexTsPath, exportStatements);
}

// Execute the function to perform the tasks
copyAndAddExports();

console.log('Denoify post build completed.');
