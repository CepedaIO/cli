import { normalize } from "path";
import { promises, existsSync } from "fs";
import { iProject, Project } from "../../models/Project";
import { createHash } from "crypto";
import { run } from "@vlegm/utils";
import chalk from "chalk";
import { generateDockerCompose } from "./generateDockerCompose"
import {ComposeProvider, StartOptions} from "../../../../types";
import {providerFromProject} from "../../services/providerFromProject";
import {generateEnv} from "./generateEnvFile";
import {generateEntrypoint} from "./generateEntrypoints";

const { readFile } = promises;

function composeProviderTSURL(project: iProject) {
  return normalize(`${project.root}/compose-provider.ts`);
}

function needsRebuild(hash: string, project: iProject) {
  return !project.hash ||
    project.hash !== hash ||
    !existsSync(`${project.root}/dist`) ||
    !existsSync(`${project.root}/docker-compose.yaml`);
}

export async function generateStartFiles(project: iProject, options: StartOptions) {
  const file = await readFile(composeProviderTSURL(project));
  const hashSum = createHash('sha256');

  hashSum.update(file);
  const hash = hashSum.digest('hex');
  console.log(`Hash: ${chalk.blueBright(hash)}`);

  if(needsRebuild(hash, project) || options.build) {
    console.log('Compose changed, building environment');
    await run('yarn', ['build'], {
      cwd: project.root,
      shell: true
    });

    project.hash = hash;
    await Project.save(project);

    const provider:ComposeProvider = providerFromProject(project);
    options.hasEnvFile = await generateEnv(provider, options);
    await generateDockerCompose(project, provider, options);
    await generateEntrypoint(project, provider, options);
  }
}
