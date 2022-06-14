import {existsSync} from "fs";
import {run} from "@cepedaio/utils";
import {basename, join} from "path";
import {Project} from "../../models/Project";

import basePackageJSON from "./package.json";
import baseTsconfigJSON from "./tsconfig.json";
import {writeFile} from "fs/promises";
import {isTestEnv, rootDir} from "../../../../configs/app";
import {initializeProject} from "../../services/initializeProject";
import {log1, log2} from "../../../../utils/log";
import {getRootPackageJSON} from "../../../../utils/getRootPackageJSON";

export async function unpack(projectName?: string) {
  if(!existsSync('./compose-provider.ts')) {
    throw new Error('No compose-provider.ts to unpack');
  }

  const cwd = process.cwd();
  const name = projectName ? projectName : basename(cwd);
  log2('Creating Project', name);

  const project = await Project.init(name, cwd);
  const rootPackageJSON = await getRootPackageJSON();

  log1('Installing dependencies...');
  basePackageJSON.dependencies[rootPackageJSON.name] = isTestEnv ? join(rootDir, `cepedaio-cli-v${rootPackageJSON.version}.tgz`) : `^${rootPackageJSON.version}`;
  await writeFile(`${project.root}/package.json`, JSON.stringify(basePackageJSON, null, 2));
  await writeFile(`${project.root}/tsconfig.json`, JSON.stringify(baseTsconfigJSON, null, 2));

  await run('yarn', ['install'], {
    cwd: project.root,
    shell: true
  });

  await initializeProject(project);
}
