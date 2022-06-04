import chalk from "chalk";
import {run} from "@vlegm/utils";
import {serviceExists} from "../services/serviceExists";
import {getProject} from "../prompts/getProject";

export async function exec(serviceName: string, command:string, projectName?: string) {
  const project = await getProject(projectName, serviceName);

  if(!serviceExists(serviceName, project)) {
    throw new Error(`Service (${serviceName}) is not part of project`);
  }

  console.log(`Executing: ${chalk.blueBright(command)}`);
  console.log(`Within Service: ${chalk.blueBright(serviceName)}`);

  await run('docker-compose', ['exec', serviceName, command], {
    cwd: project.root
  });
}
