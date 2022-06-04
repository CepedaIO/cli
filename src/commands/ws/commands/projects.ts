import chalk from 'chalk';
import {Project} from "../models/Project";

export async function projects() {
  const projects = await Project.names();
  
  if(!projects.length) {
    console.log(`There are ${chalk.redBright('no')} projects currently registered`);
  } else {
    console.log(projects.join('\n'))
  }
}