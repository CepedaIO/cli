import {run} from "@vlegm/utils";
import {getProject} from "../services/getProject";

export async function tail(service:string, projectName?: string) {
  const project = await getProject(projectName);

  await run('docker-compose', ['logs', '-ft', service], {
    cwd: project.root
  });
}
