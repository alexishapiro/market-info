import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const appStructurePath = path.join(__dirname, '../src/lib/appStructure.json');
const metadata = JSON.parse(fs.readFileSync(appStructurePath, 'utf-8'));
import { generateZodSchema } from '../scripts/generateZodSchema';
// import metadata from '../src/lib/appStructure.json';
import { writeFileIfChanged } from '../scripts/fileUtils';

async function generateSchema() {
  let schemaContent = `import { z } from 'zod';\n`;
  schemaContent += `import { Prisma } from '@prisma/client';\n\n`;
  for (const [modelName, model] of Object.entries(metadata.models)) {
    // if (typeof model === 'object' && model !== null) {
      const modelNameStr = (model as any).name as string;
      const modelAttributes = JSON.stringify((model as any).fields);
      console.log("ModelAttributes : " + modelAttributes);
      const zodSchema = generateZodSchema(model);
      console.log("ZodSchema : " + zodSchema);
      const schemaData = JSON.stringify(zodSchema as any);
      schemaContent += `export const ${modelNameStr.charAt(0).toLowerCase() + modelNameStr.slice(1)}Schema = ${zodSchema};\n`;
      schemaContent += `export type ${modelNameStr} = z.infer<typeof ${modelNameStr.charAt(0).toLowerCase() + modelNameStr.slice(1)}Schema>;\n\n`;
    // } else {
    //   console.error(`Invalid model for ${modelName}`);
    // }
  }

  // Generate a map of all schemas
  schemaContent += `export const schemas = {\n`;
  for (const modelName of Object.keys(metadata.models)) {
    const modelNameStr = (metadata.models[modelName] as any).name as string;
    schemaContent += `${modelNameStr.charAt(0).toLowerCase() + modelNameStr.slice(1)}: ${modelNameStr.charAt(0).toLowerCase() + modelNameStr.slice(1)}Schema,\n`;
  }
  schemaContent += `};\n\n`;

  // Generate a type for all model names
  const modelNames = Object.keys(metadata.models);
  schemaContent += `export type ModelName = `;
  for (const modelName of modelNames) {
    const modelNameStr = (metadata.models[modelName] as any).name as string;
    schemaContent += `'${modelNameStr.charAt(0).toLowerCase() + modelNameStr.slice(1)}'| `;
  }
  schemaContent += `"underfined";\n\n`;

  // Generate a function to get schema by model name
  schemaContent += `export function getSchemaForModel(modelName: ModelName) {\n`;
  schemaContent += `  return schemas[modelName as keyof typeof schemas];\n`;
  schemaContent += `}\n`;

  writeFileIfChanged('./src/lib/generatedSchemas.ts', schemaContent);
  console.log('Schema generated successfully!');
}

generateSchema().catch(console.error);