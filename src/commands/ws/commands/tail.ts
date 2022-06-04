import {run} from "@vlegm/utils";
import {getProject} from "../services/getProject";
import {serviceExists} from "../services/serviceExists";

export async function tail(service:string, projectName?: string) {
  const project = await getProject(projectName);

  if(!serviceExists(service, project)) {
    throw new Error('Service is not currently part of project');
  }

  await run('docker-compose', ['logs', '-ft', service], {
    cwd: project.root
  });
}
