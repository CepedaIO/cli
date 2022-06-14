import {join} from "path";
import {rootDir} from "../configs/app";
import {readFile} from "fs/promises";

export interface RootPackageJSONStub {
  name: string;
  version: string;
}

export async function getRootPackageJSON(): Promise<RootPackageJSONStub> {
  const packageJSONPath = join(rootDir, 'package.json');
  const fileContents = await readFile(packageJSONPath, 'utf-8');
  return JSON.parse(fileContents);
}
