import { run } from '@vlegm/utils';
import { ComposeProvider, isServiceFromRepo } from "../../../../types";
import {Project} from "../../models/Project";
import {existsSync} from "fs";
import {normalize} from "path";
import chalk from "chalk";
import {mkdir} from "fs/promises";

export async function createRepos(project:Project, config: ComposeProvider): Promise<any> {
  const allServicesRoot = normalize(`${project.root}/services`);

  if(!existsSync(allServicesRoot)) {
    await mkdir(allServicesRoot);
  }

  return Object.entries(config.services)
    .reduce((tail, [serviceName, service]) => {
      if(isServiceFromRepo(service)) {
        const serviceRoot = normalize(`${allServicesRoot}/${serviceName}`);

        if(!existsSync(serviceRoot)) {
          console.log(`Cloning repo for: ${chalk.greenBright(serviceName)}`);

          return tail
            .then(() => run('git', ['clone', service.repo.url, serviceName], { cwd: allServicesRoot }))
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
