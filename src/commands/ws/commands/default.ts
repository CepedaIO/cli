import chalk from 'chalk';
import { Application } from '../models/Application';
import {Project} from "../models/Project";

export async function defaultProject(newDefault?:string) {
  if(!newDefault) {
    const project = await Application.defaultProject();

    if(!project) {
      console.log(`There is ${chalk.redBright('no')} default project set`);
    } else {
      console.log(`Default project: ${chalk.blueBright(project.name)}`);
    }
  } else {
    if(!Project.has(newDefault)) {
      console.log(`There  is ${chalk.redBright('no')} project called: ${chalk.blueBright(newDefault)}`);
    } else {
      const app = await Application.get();
      app.defaults.project = newDefault;
      await Application.save(app);
      
      console.log(`Default project saved! ${chalk.blueBright(newDefault)}`);
    }
  }
}