import { normalize } from "path";
import { promises, existsSync } from "fs";
import { iProject, Project } from "../../models/Project";
import { createHash } from "crypto";
import { run } from "@vlegm/utils";
import chalk from "chalk";
import { generateDockerCompose } from "./generateDockerCompose"
import {ComposeProvider, NormalizedComposeProvider, StartOptions} from "../../../../types";
import {providerFromProject} from "../../services/providerFromProject";
import {generateEnv} from "./generateEnvFile";
import {generateEntrypoint} from "./generateEntrypoints";
import {addSources, createSources} from "../../services/sources";
import {rmdir} from "fs/promises";
import {distDir} from "../../../../config/app";

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
    await rmdir(distDir(options.root), { recursive: true });
    await run('yarn', ['build'], {
      cwd: project.root,
      shell: true
    });

    project.hash = hash;
    await Project.save(project);

    const provider:NormalizedComposeProvider = providerFromProject(project);
    addSources(provider);
    await createSources(project.servicesRoot);
    options.hasEnvFile = await generateEnv(provider, options);
    await generateDockerCompose(provider, options);
    await generateEntrypoint(provider, options);
  }
}
