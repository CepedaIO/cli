import chalk from 'chalk';
import { Application } from '../models/Application';
import {Project} from "../models/Project";

export async function defaultProject(project?:string) {
  if(!project) {
    const defaultProject = await Application.defaultProject();

    if(!defaultProject) {
      console.log(`There is ${chalk.redBright('no')} default project set`);
    } else {
      console.log(`Default project: ${chalk.blueBright(defaultProject.name)}`);
    }
  } else {
    if(!Project.has(project)) {
      console.log(`There  is ${chalk.redBright('no')} project called: ${chalk.blueBright(project)}`);
    } else {
      const app = await Application.get();
      app.defaults.project = project;
      await Application.save(app);

      console.log(`Default project saved! ${chalk.blueBright(project)}`);
    }
  }
}
