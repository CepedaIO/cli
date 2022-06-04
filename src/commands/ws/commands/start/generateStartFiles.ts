import { normalize } from "path";
import { promises, existsSync } from "fs";
import { iProject, Project } from "../../models/Project";
import { createHash } from "crypto";
import { JSAML, run } from "@vlegm/utils";
import chalk from "chalk";
import { generateDockerCompose } from "./generateDockerCompose"
import { ComposeProvider } from "../../../../types";
import {StartOptions} from "./index";

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

export async function generateStartFiles(project: iProject, environment = 'master', options: StartOptions = {}) {
  const file = await readFile(composeProviderTSURL(project));
  const hashSum = createHash('sha256');

  hashSum.update(file);
  const hash = hashSum.digest('hex');
  const isTest = environment === 'test';
  const branch = isTest ? 'master' : environment;
  console.log(`Hash: ${chalk.blueBright(hash)}`);

  if(needsRebuild(hash, project) || options.build === true) {
    console.log('Compose changed, building environment');
    await run('yarn', ['build'], {
      cwd: project.root,
      shell: true
    });

    project.hash = hash;
    await Project.save(project);

    console.log(`Configuring for: ${chalk.greenBright(branch)}`);
    const config:ComposeProvider = require(`${project.root}/dist/compose-provider.js`).default;

    const dockerCompose = await generateDockerCompose(project, config, 'local', {
      test: isTest
    });
    await JSAML.save(dockerCompose, `${project.root}/docker-compose.yaml`);
  }
}
