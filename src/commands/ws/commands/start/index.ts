import chalk from 'chalk';
import {run} from "@vlegm/utils";
import {iProject, Project} from "../../models/Project";
import { generateStartFiles } from './generateStartFiles';
import {getProject} from "../../services/getProject";

export interface StartOptions {
  build?: boolean;
  generate?: boolean;
}

export async function start(projectName?:string, environment?: string, options?: StartOptions) {
  const project:iProject | null = await getProject(projectName);

  if(!project) {
    throw new Error('No default project found, could not start');
  }

  if(!environment && (!projectName || !Project.has(projectName))) {
    /** if we have a valid project but an invalid project name, assume it's the environment tag **/
    environment = projectName;
  }

  await generateStartFiles(project, environment, options);

  if(!options || options.generate !== true) {
    console.log(`Starting project: ${chalk.blueBright(project.name)}`);
    await run('docker-compose', ['up', '--remove-orphans'], {
      cwd: project.root
    });
  }
}