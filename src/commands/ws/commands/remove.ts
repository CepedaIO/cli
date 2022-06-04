import chalk from 'chalk';
import { promises } from 'fs';
import {Project} from "../models/Project";
import { confirm } from '../prompts/confirm';
import {Application} from "../models/Application";
import {stop} from "./stop";
import {getProject} from "../prompts/getProject";

const {rm} = promises;

export async function remove(projectName: string) {
  const project = await getProject(projectName);

  const shouldDelete = await confirm(`Are you sure you want to ${chalk.redBright('delete')}? (${chalk.blueBright(projectName)})`);
  if(!shouldDelete) {
    console.log(`${chalk.redBright('Aborted!')}`);
    return;
  }

  await stop(undefined, project.name);
  await Project.remove(projectName);

  const defaultProject = await Application.defaultProject();
  if(defaultProject?.name === projectName) {
    await Application.removeDefaultProject();
  }

  console.log(`${chalk.blueBright(projectName)} has been removed!`);

  const deleteRoot = await confirm('Would you also like to delete the project\'s directory?');
  if(deleteRoot) {
    await rm(project.root, { recursive: true })
  }
}
