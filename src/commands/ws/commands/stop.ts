import chalk from "chalk";
import {run} from "@vlegm/utils";
import {getProject} from "../services/getProject";

export async function stop(projectName?: string) {
  const project = await getProject(projectName);
  console.log(`Stopping ${chalk.yellow('services')} for: ${chalk.blueBright(project?.name)}!`);

  if(!project) {
    throw new Error('No default project found, could not start');
  }

  await run('docker-compose', ['down'], {
    cwd: project.root
  });
}
