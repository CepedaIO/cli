import {normalize} from 'path';
import {homedir} from "os";

export const srcDir = normalize(`${__dirname}/..`);
export const rootDir = normalize(`${__dirname}/../..`);
export const assetsDir = normalize(`${__dirname}/../../assets`);
export const dataDir = normalize(`${homedir()}/.vlm`);
export const isTestEnv = process.env.VLEGM_CLI_ENV === 'test';

export function distDir(projectRoot:string) {
  return normalize(`${projectRoot}/.dist`);
}
