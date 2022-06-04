import chalk from 'chalk';
import {Project} from "../../models/Project";
import { startProject } from './startProject';
import {getProject} from "../../services/getProject";

export interface StartOptions {
  build?: boolean;
}

export async function start(projectName?:string, environment?: string, options?: StartOptions) {
  const project:Project = await getProject(projectName);

  if(!project) {
    throw new Error('No default project found, could not start');
  }

  if(!environment && !Project.has(projectName)) {
    /** if we have a valid project but an invalid project name, assume it's the environment tag **/
    environment = projectName;
  }

  console.log(`Starting project: ${chalk.blueBright(project.name)}`);
  return startProject(project, environment, options);
}