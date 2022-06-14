import {promises} from "fs";
import {rootDir} from "../../../../configs/app";
import {createComposeProvider} from "./createComposeProvider";
import {run} from "@cepedaio/utils";
import {WorkstationAnswers} from "../../../../types";
import packageJSON from "../unpack/package.json";
import tsconfigJSON from "../unpack/tsconfig.json";
import {getRoot} from "../../services/getRoot";
import {getRootPackageJSON} from "../../../../utils/getRootPackageJSON";

const { writeFile, mkdir } = promises;

export async function createProjectFiles(answers: WorkstationAnswers) {
  const root = getRoot(answers.name);
  await mkdir(root, { recursive: true });

  const compose = await createComposeProvider(answers);
  await writeFile(`${root}/compose-provider.ts`, compose);
  const rootPackageJSON = await getRootPackageJSON();

  packageJSON.dependencies[rootPackageJSON.name] = rootDir;
  await writeFile(`${root}/package.json`, JSON.stringify(packageJSON, null, 2));
  await writeFile(`${root}/tsconfig.json`, JSON.stringify(tsconfigJSON, null, 2));

  await run('yarn', ['install'], {
    cwd: root,
    shell: true
  });
}
