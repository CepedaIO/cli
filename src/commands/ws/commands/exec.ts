import chalk from "chalk";
import {run} from "@vlegm/utils";
import {getProject} from "../services/getProject";

export async function exec(service: string, command:string, projectName?: string) {
  const project = await getProject(projectName);
  console.log(`Executing: ${chalk.blueBright(command)}`);
  console.log(`Within Service: ${chalk.blueBright(service)}`);

  await run('docker-compose', ['exec', service, command], {
    cwd: project.root
  });
}
