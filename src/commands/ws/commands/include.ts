import {getProject} from "../services/getProject";
import {Project} from "../models/Project";
import chalk from "chalk";
import {serviceExists} from "../services/serviceExists";
import {servicesForProject} from "../services/servicesForProject";

export async function include(service?: string, projectName?: string) {
  const project = await getProject(projectName, service);

  if(serviceExists(service, project)) {
    project.excluded = project.excluded.filter((excluded) => excluded !== service);
    project.hash = '';
    await Project.save(project);
  }

  const services = servicesForProject(project);
  const included = services.filter((service) => !project.excluded.includes(service));
  if(included.length === 0) {
    console.log(`${chalk.redBright('Nothing')} included!`);
  } else {
    console.log(`Included:\n\t${chalk.greenBright(included.join('\n\t'))}`)
  }
}
