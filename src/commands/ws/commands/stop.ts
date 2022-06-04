import chalk from "chalk";
import {run} from "@vlegm/utils";
import {getProject} from "../services/getProject";

export async function stop(projectName?: string) {
  console.log(`Starting ${chalk.yellow('services')}!`);
  const project = await getProject(projectName);

  if(!project) {
    throw new Error('No default project found, could not start');
  }

  await run('docker-compose', ['down'], {
    cwd: project.root
  });
}