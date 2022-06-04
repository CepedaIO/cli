import {NormalizedComposeProvider, RepoInfo} from "../../../types";
import {Service} from "../docker-services";
import {existsSync} from "fs";
import {mkdir} from "fs/promises";
import {run} from "@vlegm/utils";
import chalk from "chalk";
import {addSource} from "./compose";



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
          const runCommand = async (init:string) => {
            const command = init.split(' ');
            await run(command[0], command.slice(1), {
              cwd: serviceRoot,
              shell: true
            });
          }

          if(Array.isArray(source.init)) {
            for(const init of source.init) {
              await runCommand(init);
            }
          } else if(source.init) {
            await runCommand(source.init);
          }
        });
    }
  }

  return tail;
}
