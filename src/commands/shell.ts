import { run } from "@cepedaio/utils";
import { register } from "../utils/register";
import { Command } from "commander";
import { homedir } from 'os';
import { normalize } from 'path';
import {log1, log2, verbose} from "../utils/log";

interface ShellOptions {
  host: boolean; // false
  containerDest: string; // /mnt/host
  ssh: boolean; // false
  docker: boolean; // false
  environment?: NodeJS.Dict<string>;
  include: string;
}

register('shell [image] [cmd...]', (program: Command) => {
  return program.description('Attempt to shell into an image with an auto-removing container')
    .option('-c, --containerDest <containerDest>', 'Change the container destination for host mount', '/mnt/host')
    .option('-i, --include <include>', 'Mounts comma delimited list of directories, relative to (and instead of) CWD', '')
    .option('-s, --ssh', "Mount SSH files", false)
    .option('-d, --docker', 'Mount Docker daemon', false)
    .option('-a, --args', 'Pass through args direction to docker\s run command', '')
    .action(shell);
});

export async function shell(image = 'dev', cmdArr:string[] = [], options:ShellOptions) {
  const sshDir = normalize(`${homedir()}/.ssh`);
  let cmd = cmdArr.length === 0 ? '' : cmdArr.join(' ');

  if(image.toLowerCase() === 'dev') {
    image = 'vlegm/dev-alpine:latest'

    if(!cmd) {
      cmd = '/bin/zsh';
    }
  }

  if(!cmd) {
    cmd = '/bin/sh';
  }

  log2('image', image);
  log2('cmd', cmd);

  const args = [
    '-it',
    '--rm',
    '-w', options.containerDest
  ];

  if(options.include) {
    const relativeMounts = options.include.split(',')
      .reduce((prev, relativeDir) => {
        const hostPath = normalize(`${process.cwd()}/${relativeDir}`);
        return prev.concat('-v', `${hostPath}:${options.containerDest}/${relativeDir}`)
      }, [] as string[])

    args.push.apply(args, relativeMounts);
  } else {
    args.push.apply(args, [
      '-v', `${process.cwd()}:${options.containerDest}`
    ])
  }

  if(options.docker) {
    log1('Injecting docker');
    args.push.apply(args, [
      '-v', `//var/run/docker.sock:/var/run/docker.sock`,
      '-v', `//var/run/docker.pid:/var/run/docker.pid`,
    ]);
  }

  if(options.ssh) {
    log1('Injecting SSH');
    args.push.apply(args, [
      '-v', `${sshDir}:/mnt/.ssh`
    ]);
  }

  if(options.environment) {
    Object.entries(options.environment).forEach(([key, value]) => {
      args.push(`-e`);
      args.push(`${key}=${value}`);
    });
  }

  verbose('Args:', ...args);

  await run('docker', [
    'run',
    ...args,
    image,
    ...cmd.split(' ')
  ]);
}
