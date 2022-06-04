import {Application} from "../models/Application";
import {iProject, Project} from "../models/Project";
import chalk from "chalk";

export async function getProject(projectName?: string, serviceName?:string): Promise<iProject> {
  let project:iProject | undefined;

  if(projectName) {
    project = await Project.get(projectName);
  }

  if(!project) {
    project = await Project.get(serviceName);
  }

  if(!project) {
    project = await Application.defaultProject();
  }

  if(!project) {
    throw new Error('There is no chosen or default project to use');
  }

  console.log(`Running action for: ${chalk.blueBright(project.name)}`)
  return project;
}
