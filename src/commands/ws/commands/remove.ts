import chalk from 'chalk';
import { promises } from 'fs';
import {Project} from "../models/Project";
import { confirm } from '../prompts/confirm';
import {Application} from "../models/Application";
import {stop} from "./stop";

const {rm} = promises;

export async function remove(name: string) {
  if(!Project.has(name)) {
    console.log(`There is no project named: ${chalk.blueBright(name)}`);
    return;
  }

  const project = await Project.get(name);

  if(!project) {
    throw new Error(`No project named: ${name}`)
  }

  const shouldDelete = await confirm(`Are you sure you want to ${chalk.redBright('delete')}? (${chalk.blueBright(name)})`);
  if(!shouldDelete) {
    console.log(`${chalk.redBright('Aborted!')}`);
    return;
  }

  await stop(undefined, project.name);
  await Project.remove(name);

  const defaultProject = await Application.defaultProject();
  if(defaultProject?.name === name) {
    await Application.removeDefaultProject();
  }

  console.log(`${chalk.blueBright(name)} has been removed!`);

  const deleteRoot = await confirm('Would you also like to delete the project\'s directory?');
  if(deleteRoot) {
    await rm(project.root, { recursive: true })
  }
}
