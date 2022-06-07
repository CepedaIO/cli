import { register } from "../utils/register";
import { Command } from "commander";
import { get } from 'https';
import { resolve, normalize } from 'path';
import { Extract } from 'unzipper';
import mv from 'mv';
import { readdir, rm } from "fs/promises";
import {run} from "@cepedaio/utils";
import chalk from "chalk";

register('vue [dir]', (program: Command) => {
  return program.description('Downloads and install Vue 3 start project with TailwindCSS')
    .action(vue);
});

export async function vue(dir:string = process.cwd()) {
  const workDir = resolve(dir);
  const projectDir = `${workDir}/vue-3-starter-main`;

  return new Promise<void>(async (resolve, reject) => {
    console.log(`${chalk.magentaBright('Downloading project...')}: ${workDir}`)
    get('https://codeload.github.com/vlegm/vue-3-starter/zip/refs/heads/main', (response) => {
      response.pipe(Extract({
        path: workDir
      })).on('error', reject)
        .on('finish', async () => {
          const files = await readdir(projectDir);
          const moves = files.map((file) => {
            const filePath = normalize(`${projectDir}/${file}`);
            const destPath = normalize(`${workDir}/${file}`);
            return new Promise<void>((mvResolve, mvReject) => mv(filePath, destPath, (err) => {
              if(err) mvReject(err);
              mvResolve();
            }))
          });
          return Promise.all(moves)
            .then(() => rm(projectDir, { recursive: true, force: true }))
            .then(() => console.log(`${chalk.magentaBright('Install dependencies...')}: ${workDir}`))
            .then(() => run('yarn', ['install'], { cwd: workDir, shell: true }))
        });
    });
  });
}
