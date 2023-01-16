import { normalize } from "path";
import { promises, existsSync } from "fs";
import { iProject, Project } from "../../models/Project";
import { createHash } from "crypto";
import { run } from "@cepedaio/utils";
import chalk from "chalk";
import {StartOptions} from "../../../../types";
import {definitionsForProject} from "../../services/projects/definitionsForProject";
import {rm} from "fs/promises";
import {distDir} from "../../../../configs/app";
import {initializeProject} from "../../services/projects/initializeProject";
import {DockerResolver} from "../../services/resolvers/DockerResolver";
import {NodeResolver} from "../../services/resolvers/NodeResolver";

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

    await run('yarn', ['build'], { cwd: project.root, shell: true});
    
    project.hash = hash;
    await Project.save(project);
    await initializeProject(project);

    const { app: { environments, providers } } = definitionsForProject(project);
    const dockerResolver = new DockerResolver();
    const env = environments.find((env) => env.name === options.env);
    
    if(!env) throw new Error(`No environment defined for: ${options.env}`);
    
    await dockerResolver.generate(providers, {
      env,
      project,
      linkProvider: new NodeResolver()
    });
  }
}
