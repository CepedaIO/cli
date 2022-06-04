import { getRepos } from '../../prompts/getRepos';
import { getServices } from '../../prompts/getServices';
import { getEnv } from '../../prompts/getEnv';
import { confirm } from '../../prompts/confirm';
import { createProject } from './createProject';
import { Project } from "../../models/Project";
import { getRoot } from '../../services/getRoot';
import {WorkstationAnswers} from "../../../../types";

export async function init(name: string) {
  const answers: WorkstationAnswers = {
    name,
    root: getRoot(name),
    repos: await getRepos(),
    services: await getServices(),
    env: await getEnv()
  };

  if (!await confirm('Create your workstation?')) {
    return;
  }

  await Project.init(name);
  await createProject(answers);
}
