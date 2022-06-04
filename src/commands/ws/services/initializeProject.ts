import {NormalizedComposeProvider} from "../../../types";
import {providerFromProject} from "./providerFromProject";
import {Composer, composer} from "./composer";
import {iProject, Project} from "../models/Project";
import {existsSync} from "fs";
import {mkdir} from "fs/promises";
import chalk from "chalk";
import {run} from "@vlegm/utils";
import {log1} from "../../../utils/log";

export async function initializeProject(project:iProject) {
  log1('Initializing Project');
  await run('npx', ['tsc'], {
    cwd: project.root,
    shell: true
  });

  const provider:NormalizedComposeProvider = providerFromProject(project);
  addSources(composer, provider);
  await createSources(project, composer);
  return provider;
}

function addSources(composer:Composer, provider: NormalizedComposeProvider) {
  Object.entries(provider.services)
    .forEach(([serviceName, service]) => {
      if(!service) {
        return;
      }

      if(service.source) {
        composer.addSource(serviceName, service.source);
      }
    });
}

async function createSources(project:iProject, composer:Composer) {
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
