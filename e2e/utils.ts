import {config} from "../configs/e2e";
import {mkdir, rm} from "fs/promises";
import {existsSync} from "fs";
import {expect} from "chai";
import {isAbsolute, normalize} from "path";

export async function setup() {
  if(!existsSync(config.tmpDir)) {
    await mkdir(config.tmpDir);
  }
}

export async function cleanup() {
  await rm(config.tmpDir, { recursive: true, force: true });
}

export function expectExists(urls: string[], relative?: string) {
  urls.forEach((url) => {
    if(relative && !isAbsolute(url)) {
      const path = normalize(`${relative}/${url}`);
      expect(existsSync(path), `Exists: ${url}`).to.be.true;
    } else {
      console.log(existsSync(url) === true);
      expect(existsSync(url), `Exists: ${url}`).to.be.true;
    }
  });
}
