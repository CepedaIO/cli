import chai from "chai";
import chaiString from "chai-string";
import { normalize } from "path";
import {promises, existsSync} from "fs";
chai.use(chaiString);

const { mkdir } = promises;

export const config = {
  project: 'test-project',
  tmpDir: normalize(`${__dirname}/../e2e/tmp`),
  reposDir: normalize(`${__dirname}/../e2e/repos`)
}

before(async () => {
  if(!existsSync(config.tmpDir)) {
    await mkdir(config.tmpDir);
  }
})
