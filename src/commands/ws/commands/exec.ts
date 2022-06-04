import chalk from "chalk";
import {run} from "@vlegm/utils";
import {getProject} from "../services/getProject";
import {Project} from "../models/Project";

export async function exec(projectName?: string, service?: string, command?:string) {
  const project = await getProject(projectName);

  if(!project) {
    throw new Error('No default project found, could not start');
  }

  if(!projectName && !service && !command) {
    throw new Error('Must provide a service to execute command in');
  }

  if(projectName && !service && !command) {
    service = projectName;
  }

  if(projectName && service && !command && !Project.has(projectName)) {
    command = service;
  }

  if(!command) {
    command = "bash";
  }

  console.log(`Attaching to: ${chalk.blueBright(project.name)}!`);
  await run('docker-compose', ['exec', service, command], {
    cwd: project.root
  });
}
