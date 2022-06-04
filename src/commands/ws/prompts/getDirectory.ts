import inquirer from 'inquirer';
import { isAbsolute, normalize } from 'path';

export async function getDirectory(message: string, defaultDir:string = process.cwd()): Promise<string> {
  const { dir } = await inquirer.prompt([
    {
      type: 'input',
      name: 'dir',
      message,
      default: defaultDir
    }
  ]);

  const destination = isAbsolute(dir) ? dir : `${process.cwd()}/${dir}`;
  return normalize(destination);
}