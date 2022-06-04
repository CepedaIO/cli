import chalk from "chalk";
import {run} from "@vlegm/utils";
import {getProject} from "../services/getProject";

export async function exec(service: string, command:string, projectName?: string) {
  const project = await getProject(projectName);

  if(!project) {
    if (projectName) {
      throw new Error(`Could not find project: ${projectName}`)
    }

    throw new Error('No default project found, could not start');
  }

  console.log(`Attaching to: ${chalk.blueBright(project.name)}!`);
  console.log(`Executing: ${chalk.blueBright(command)}`);
  console.log(`Within Service: ${chalk.blueBright(service)}`);
  await run('docker-compose', ['exec', service, command], {
    cwd: project.root
  });
}
