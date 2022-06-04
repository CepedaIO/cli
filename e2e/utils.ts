import {config} from "../configs/e2e";
import {mkdir, rm} from "fs/promises";
import {existsSync} from "fs";
import {expect} from "chai";
import {isAbsolute, normalize} from "path";
import {providerFromPath} from "../src/commands/ws/services/providerFromProject";
import {ComposeProvider, NormalizedComposeProvider} from "../dist";

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

const providerCache:Map<string, NormalizedComposeProvider> = new Map();
export async function getProviderFromPath(path:string): Promise<NormalizedComposeProvider> {
  if(providerCache.has(path)) {
    return providerCache.get(path)!;
  }

  const provider = providerFromPath(path);
  console.log(7);
  providerCache.set(path, provider);
  console.log(8);
  //console.log(provider);
  return provider;
}
