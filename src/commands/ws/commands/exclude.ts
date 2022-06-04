import {Project} from "../models/Project";
import {serviceExists} from "../services/serviceExists";
import chalk from "chalk";
import {getProject} from "../prompts/getProject";

export async function exclude(serviceName?: string, projectName?: string) {
  const project = await getProject(projectName, serviceName);

  if(serviceExists(serviceName, project)) {
    if (!project.excluded.includes(serviceName)) {
      project.excluded.push(serviceName);
    }

    project.hash = '';
    await Project.save(project);
  }

  if(project.excluded.length === 0) {
    console.log(`${chalk.redBright('Nothing')} excluded!`);
  } else {
    console.log(`Excluded:\n\t${chalk.greenBright(project.excluded.join('\n\t'))}`);
  }
}
