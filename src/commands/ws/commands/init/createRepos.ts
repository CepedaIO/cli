import { run } from '@vlegm/utils';
import { ComposeProvider, isRepoReference } from "../../../../types";
import {iProject, getServiceRoot} from "../../models/Project";
import {existsSync} from "fs";
import chalk from "chalk";
import {mkdir} from "fs/promises";

export async function createRepos(project:iProject, config: ComposeProvider): Promise<any> {
  if(!existsSync(project.servicesRoot)) {
    await mkdir(project.servicesRoot);
  }

  return Object.entries(config.services || {})
    .reduce((tail, [serviceName, service]) => {
      if(isRepoReference(service)) {
        const serviceRoot = getServiceRoot(project, serviceName);

        if(!existsSync(serviceRoot)) {
          console.log(`Cloning repo for: ${chalk.greenBright(serviceName)}`);

          return tail
            .then(() => run('git', ['clone', service.repo.url, serviceName], { cwd: project.servicesRoot }))
            .then(() => {
              if(service.repo.init) {
                const command = service.repo.init.split(' ');
                return run(command[0], command.slice(1), {
                  cwd: serviceRoot,
                  shell: true
                });
              }
            });
        }
      }

      return tail;
    },Promise.resolve());
}
