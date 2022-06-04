import {existsSync} from "fs";
import {run} from "@vlegm/utils";
import {basename, normalize} from "path";
import {Project} from "../models/Project";
import {assetsDir} from "../../../config/app";
import {copyFiles} from "../services/copyFiles";
import {ComposeProvider} from "../../../types";
import {createRepos} from "./init/createRepos";
import chalk from "chalk";

export async function unpack(projectName?: string) {
  if(!existsSync('./compose-provider.ts')) {
    throw new Error('No compose-provider.ts to unpack');
  }

  const cwd = process.cwd();
  const name = projectName ? projectName : basename(cwd);
  console.log(`Creating project: ${chalk.greenBright(name)}`);

  const project = await Project.init(name, cwd);

  console.log('Installing dependencies...');
  await copyFiles([
    normalize(`${assetsDir}/tsconfig.json`),
    normalize(`${assetsDir}/package.json`)
  ], project.root);

  await run('yarn', ['install'], {
    cwd: project.root,
    shell: true
  });

  console.log('Building project...');
  await run('yarn', ['build'], {
    cwd: project.root,
    shell: true
  });

  const config:ComposeProvider = require(`${project.root}/dist/compose-provider.js`).default;
  await createRepos(project, config);
}