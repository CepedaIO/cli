import { run } from '@vlegm/utils';
import { ComposeProvider, isServiceFromRepo } from "../../../../types";
import {Project} from "../../models/Project";
import {existsSync} from "fs";
import chalk from "chalk";

export async function createRepos(project:Project, config: ComposeProvider): Promise<any> {
  return Object.entries(config.services)
    .reduce((tail, [serviceName, service]) => {
      if(isServiceFromRepo(service)) {
        const serviceRoot = `${project.root}/${serviceName}`;

        if(!existsSync(serviceRoot)) {
          console.log(`Cloning repo for: ${chalk.greenBright(serviceName)}`);

          return tail
            .then(() => run('git', ['clone', service.repo.url, serviceName], { cwd: project.root }))
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
