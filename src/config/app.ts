import {normalize} from 'path';
import {homedir} from "os";
import {iProject} from "../commands/ws/models/Project";

export const srcDir = normalize(`${__dirname}/..`);
export const rootDir = normalize(`${__dirname}/../..`);
export const assetsDir = normalize(`${__dirname}/../../assets`);
export const dataDir = normalize(`${homedir()}/.vlm`);
export function distDir(projectRoot:string) {
  return normalize(`${projectRoot}/.dist`);
}
