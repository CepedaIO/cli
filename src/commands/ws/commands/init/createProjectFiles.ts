import {promises} from "fs";
import {join} from "path";
import {rootDir} from "../../../../configs/app";
import {createComposeProvider} from "./createComposeProvider";
import {run} from "@vlegm/utils";
import {WorkstationAnswers} from "../../../../types";
import packageJSON from "../unpack/package.json";
import tsconfigJSON from "../unpack/tsconfig.json";
import {getRoot} from "../../services/getRoot";

const { writeFile, mkdir } = promises;

export async function createProjectFiles(answers: WorkstationAnswers) {
  const root = getRoot(answers.name);
  await mkdir(root, { recursive: true });

  const compose = await createComposeProvider(answers);
  await writeFile(`${root}/compose-provider.ts`, compose);

  packageJSON.dependencies['@vlegm/cli'] = rootDir;
  await writeFile(`${root}/package.json`, JSON.stringify(packageJSON, null, 2));
  await writeFile(`${root}/tsconfig.json`, JSON.stringify(tsconfigJSON, null, 2));

  await run('yarn', ['install'], {
    cwd: root,
    shell: true
  });
}
