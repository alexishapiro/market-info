import fs from 'fs/promises';
import path from 'path';

export async function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  try {
    await fs.access(dirname);
  } catch (error) {
    await fs.mkdir(dirname, { recursive: true });
  }
}

export async function writeFileIfChanged(filePath: string, content: string) {
  await ensureDirectoryExistence(filePath);

  try {
    const existingContent = await fs.readFile(filePath, 'utf8');
    if (existingContent === content) {
      console.log(`File ${filePath} is up to date.`);
      return;
    }
  } catch (error) {
    // File doesn't exist, we'll create it
  }

  await fs.writeFile(filePath, content, 'utf8');
  console.log(`Updated file: ${filePath}`);
}