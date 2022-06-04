import { normalize } from "path";
import { promises, existsSync } from "fs";
import { iProject, Project } from "../../models/Project";
import { createHash } from "crypto";
import { run } from "@vlegm/utils";
import chalk from "chalk";
import { generateDockerCompose } from "./generateDockerCompose"
import {StartOptions} from "../../../../types";
import {providerFromProject} from "../../services/providerFromProject";
import {generateEnv} from "./generateEnvFile";
import {generateEntrypoint} from "./generateEntrypoints";
import {rm} from "fs/promises";
import {distDir} from "../../../../configs/app";
import {initializeProject} from "../../services/initializeProject";

const { readFile } = promises;

function composeProviderTSURL(project: iProject) {
  return normalize(`${project.root}/compose-provider.ts`);
}

function needsRebuild(project: iProject, hash: string) {
  return !project.hash ||
    project.hash !== hash ||
    !existsSync(distDir(project.root)) ||
    !existsSync(`${project.root}/docker-compose.yaml`);
}

export async function generateStartFiles(project: iProject, options: StartOptions) {
  const file = await readFile(composeProviderTSURL(project));
  const hashSum = createHash('sha256');
  hashSum.update(file);
  const hash = hashSum.digest('hex');
  console.log(`Hash: ${chalk.blueBright(hash)}`);

  if(needsRebuild(project, hash) || options.build) {
    console.log('Compose changed, building environment');

    if(existsSync(distDir(project.root))) {
      await rm(distDir(project.root), { recursive: true });
    }

    await run('yarn', ['build'], {
      cwd: project.root,
      shell: true
    });
    project.hash = hash;
    await Project.save(project);

    await initializeProject(project);

    const provider = providerFromProject(project);
    options.hasEnvFile = await generateEnv(project, provider, options);
    await generateDockerCompose(project, provider, options);
    await generateEntrypoint(project, provider, options);
  }
}
