import {normalize} from 'path';
import {homedir} from "os";

export const rootDir = normalize(`${__dirname}/..`);
export const projectDir = normalize(`${__dirname}/../..`);
export const assetsDir = normalize(`${__dirname}/../../assets`);
export const dataDir = normalize(`${homedir()}/.vlm`)
