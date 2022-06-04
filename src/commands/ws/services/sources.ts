import {NormalizedComposeProvider, RepoInfo} from "../../../types";
import {Service} from "../docker-services";
import {existsSync} from "fs";
import {mkdir} from "fs/promises";
import {run} from "@vlegm/utils";
import chalk from "chalk";

export const sources:Map<string, RepoInfo> = new Map();

export function addSource(serviceName:string, source: RepoInfo) {
  sources.set(serviceName, source);
}

export function addSources(provider: NormalizedComposeProvider) {
  Object.entries(provider.services)
    .forEach(([serviceName, service]) => {
      if(service instanceof Service) {
        service.sources.forEach((source) => addSource(serviceName, source));
      }
    });
}

export async function createSources(servicesRoot: string): Promise<any> {
  if(!existsSync(servicesRoot)) {
    await mkdir(servicesRoot);
  }

  let tail = Promise.resolve();
  for(const [serviceName, source] of sources.entries()) {
    const serviceRoot = `${servicesRoot}/${serviceName}`;

    if(!existsSync(serviceRoot)) {
      console.log(`Cloning repo for: ${chalk.greenBright(serviceName)}`);

      tail = tail
        .then(() => run('git', ['clone', source.url, serviceName], { cwd: servicesRoot }))
        .then(async () => {
          if(source.init) {
            const command = source.init.split(' ');
            await run(command[0], command.slice(1), {
              cwd: serviceRoot,
              shell: true
            });
          }
        });
    }
  }

  return tail;
}
