import {existsSync} from "fs";
import {mkdir} from "fs/promises";
import {run} from "@vlegm/utils";
import chalk from "chalk";
import {Composer} from "./composer";
import {iProject, Project} from "../models/Project";

export async function createSources(project:iProject, composer:Composer): Promise<any> {
  if(project.sources.initialized.length === 0 &&!existsSync(project.services.root)) {
    await mkdir(project.services.root);
  }

  let tail = Promise.resolve();
  for(const [serviceName, source] of composer.getSources().entries()) {
    if(project.sources.initialized.includes(serviceName)) {
      break;
    }

    const serviceRoot = `${project.services.root}/${serviceName}`;

    if(!existsSync(serviceRoot)) {
      console.log(`Cloning repo for: ${chalk.greenBright(serviceName)}`);

      tail = tail
        .then(() => run('git', ['clone', source.url, serviceName], { cwd: project.services.root }))
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
        })
        .then(async () => {
          project.sources.initialized.push(serviceName);
          await Project.save(project);
        })
    }
  }

  return tail;
}
