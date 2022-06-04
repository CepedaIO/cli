const chai = require("chai");
const chaiString = require("chai-string");
import { normalize } from "path";
import {promises, existsSync} from "fs";
import {homedir} from "os";

chai.use(chaiString);

const { mkdir } = promises;

export const config = {
  project: 'test-project',
  tmpDir: normalize(`${__dirname}/../e2e/tmp`),
  tmpDataDir: normalize(`${homedir()}/.vlm/tmp`),
  reposDir: normalize(`${__dirname}/../e2e/repos`)
}

before(async () => {
  if(!existsSync(config.tmpDir)) {
    await mkdir(config.tmpDir);
  }
})
