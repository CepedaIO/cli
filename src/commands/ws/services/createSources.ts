import {existsSync} from "fs";
import {mkdir} from "fs/promises";
import {run} from "@vlegm/utils";
import chalk from "chalk";
import {Composer} from "./composer";
import {iProject, Project} from "../models/Project";

export async function createSources(project:iProject, composer:Composer) {
  if(project.sources.initialized.length === 0 &&!existsSync(project.services.root)) {
    await mkdir(project.services.root);
  }

  for(const [serviceName, source] of composer.getSources().entries()) {
    if(project.sources.initialized.includes(serviceName)) {
      break;
    }

    const serviceRoot = `${project.services.root}/${serviceName}`;

    if(!existsSync(serviceRoot)) {
      console.log(`Cloning repo for: ${chalk.greenBright(serviceName)}`);
      await run('git', ['clone', source.url, serviceName], { cwd: project.services.root });

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

      project.sources.initialized.push(serviceName);
      await Project.save(project);
    }
  }
}
