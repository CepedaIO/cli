import {existsSync} from "fs";
import {run} from "@vlegm/utils";
import {basename} from "path";
import {Project} from "../../models/Project";
import {ComposeProvider} from "../../../../types";
import {createRepos} from "../init/createRepos";
import {JSAML} from "@vlegm/utils";
import chalk from "chalk";

import packageJSON from "./package.json";
import tsconfigJSON from "./tsconfig.json";
import {writeFile} from "fs/promises";
import {projectDir} from "../../../../config/app";

export async function unpack(projectName?: string) {
  if(!existsSync('./compose-provider.ts')) {
    throw new Error('No compose-provider.ts to unpack');
  }

  const cwd = process.cwd();
  const name = projectName ? projectName : basename(cwd);
  console.log(`Creating project: ${chalk.greenBright(name)}`);

  const project = await Project.init(name, cwd);

  console.log('Installing dependencies...');

  const ownPackageJSON = await JSAML.read(`${projectDir}/package.json`) as any;
  packageJSON.dependencies['@vlegm/cli'] = ownPackageJSON.version;
  await writeFile(`${project.root}/package.json`, JSON.stringify(packageJSON, null, 2));
  await writeFile(`${project.root}/tsconfig.json`, JSON.stringify(tsconfigJSON, null, 2));

  await run('yarn', ['install'], {
    cwd: project.root,
    shell: true
  });

  console.log('Building project...');
  await run('npx', ['tsc'], {
    cwd: project.root,
    shell: true
  });

  const config:ComposeProvider = require(`${project.root}/dist/compose-provider.js`).default;
  await createRepos(project, config);
}
