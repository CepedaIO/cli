import {getProject} from "../services/getProject";
import {Project} from "../models/Project";
import {serviceExists} from "../services/serviceExists";
import chalk from "chalk";

export async function exclude(service?: string, projectName?: string) {
  const project = await getProject(projectName, service);

  if(serviceExists(service, project)) {
    if (!project.excluded.includes(service)) {
      project.excluded.push(service);
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
