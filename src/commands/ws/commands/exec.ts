import chalk from "chalk";
import {run} from "@vlegm/utils";
import {getProject} from "../services/getProject";
import {serviceExists} from "../services/serviceExists";

export async function exec(service: string, command:string, projectName?: string) {
  const project = await getProject(projectName);

  if(!serviceExists(service, project)) {
    throw new Error('Service is not currently part of project');
  }

  console.log(`Executing: ${chalk.blueBright(command)}`);
  console.log(`Within Service: ${chalk.blueBright(service)}`);

  await run('docker-compose', ['exec', service, command], {
    cwd: project.root
  });
}
