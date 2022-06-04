const chai = require("chai");
const chaiString = require("chai-string");
import { normalize } from "path";
import {promises, existsSync} from "fs";
import {homedir} from "os";

chai.use(chaiString);

const { mkdir } = promises;

const rootDir = normalize(`${__dirname}/../../`);
export const config = {
  project: 'test-project',
  rootDir,
  tmpDir: normalize(`${rootDir}/tmp`),
  vlmDataDir: normalize(`${homedir()}/.vlm`),
  reposDir: normalize(`${__dirname}/repos`)
}

before(async () => {
  if(!existsSync(config.tmpDir)) {
    await mkdir(config.tmpDir);
  }
})
