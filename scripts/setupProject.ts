
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { exec } from 'child_process';

const execAsync = promisify(exec);

async function runScript(scriptName: string) {
  const LIB_DIR = path.join(process.cwd(), 'scripts');
  const scriptPath = path.join(LIB_DIR, scriptName);
  try {
    const { stdout, stderr } = await execAsync(`node --loader ts-node/esm --experimental-specifier-resolution=node --no-warnings ${scriptPath}`);
    console.log(stdout);
    if (stderr) console.error(stderr);
  } catch (error) {
    console.error(`Error running ${scriptName}:`, error);
    if (error instanceof Error) {
      console.error(`Error message: ${error.message}`);
      console.error(`Error stack: ${error.stack}`);
    }
    throw error;
  }
}
async function setupProject() {
  try {
    console.log('Generating schema...');
    await runScript('generateSchema.ts');

    console.log('Generating app structure...');
    await runScript('generateAppStructure.ts');

    // console.log('Generating API routes...');
    // await runScript('generateApiRoutes.ts');

    // console.log('Setting up server files...');
    // await runScript('generateServerFiles.ts');

    // console.log('Generating NextJS core pages...');
    // await runScript('generateNextJSCorePages.ts');

    // console.log('Generating pages...');
    // await runScript('generatePages.ts');
    
    // console.log('Generating components...');
    // await runScript('generateComponents.ts');

    // console.log('Generating lib files...');
    // await runScript('generateLibFiles.ts');

    // console.log('Generating app navigation...');
    // await runScript('generateAppNav.ts');

    // console.log('Generating optimization files...');
    // await runScript('generateOptimizationFiles.ts');

    // if (process.env.RUN_SEED === 'true') {
    //   console.log('Seeding database...');
    //   await runScript('seedDatabase.ts');
    // }

    console.log('Project setup complete!');
  } catch (error) {
    console.error('Error during project setup:', error);
  }
}

setupProject();