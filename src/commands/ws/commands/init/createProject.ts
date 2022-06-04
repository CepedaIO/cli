import {promises} from "fs";
import { normalize, basename } from "path";
import {assetsDir} from "../../../../config/app";
import {createComposeProvider} from "./createComposeProvider";
import { run } from "@vlegm/utils";
import {getRoot} from "../../services/getRoot";
import {WorkstationAnswers} from "../../../../types";

const { writeFile, mkdir, copyFile } = promises;

async function copyFiles(urls: string[], dest:string) {
  return Promise.all(urls.map((url) => copyFile(url, `${dest}/${basename(url)}`)));
}

export async function createProject(answers: WorkstationAnswers) {
  const root = getRoot(answers.name);
  await mkdir(root, { recursive: true });

  const compose = await createComposeProvider(answers);
  await writeFile(`${root}/compose-provider.ts`, compose);

  await copyFiles([
    normalize(`${assetsDir}/tsconfig.json`),
    normalize(`${assetsDir}/package.json`)
  ], root);

  await run('yarn', ['install'], {
    cwd: root,
    shell: true
  });
}
