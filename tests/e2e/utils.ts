import {config} from "./config";
import {mkdir, rm} from "fs/promises";
import {existsSync} from "fs";
import {expect} from "chai";
import {isAbsolute, normalize, join} from "path";

export async function setup(dir:string) {
  if(!existsSync(dir)) {
    await mkdir(dir, { recursive:true });
  }
}

export async function cleanup(suiteName:string, suiteDir:string) {
  await rm(suiteDir, { recursive: true, force: true });
  await rm(join(config.cepDataDir, suiteName), { recursive: true, force: true });
}

export function expectExists(urls: string[], relative?: string) {
  urls.forEach((url) => {
    if(relative && !isAbsolute(url)) {
      const path = normalize(`${relative}/${url}`);
      expect(existsSync(path), `Exists: ${url}`).to.be.true;
    } else {
      expect(existsSync(url), `Exists: ${url}`).to.be.true;
    }
  });
}
