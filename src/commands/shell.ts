import { run } from "@vlegm/utils";
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
    .option('-h, --host', 'Mounts the current work directory into the container destination', false)
    .option('-c, --containerDest <containerDest>', 'Change the container destination for host mount', '/mnt/host')
    .option('-i, --include <include>', 'Mounts comma delimited list of directories, relative to the host source path', '')
    .option('-s, --ssh', "Mount SSH files", false)
    .option('-d, --docker', 'Mount Docker daemon', false)
    .option('-a, --args', 'Pass through args direction to docker\s run command', '')
    .action(shell);
});

export async function shell(image = 'vlegm/dev-alpine:latest', cmdArr:string[] = [], options:ShellOptions) {
  const sshDir = normalize(`${homedir()}/.ssh`);
  const cmd = cmdArr.length === 0 ? '/bin/zsh' : cmdArr.join(' ');

  log2('image', image);
  log2('cmd', cmd);

  const args = [
    '-it',
    '--rm',
    '-w', options.containerDest
  ];

  if(options.host) {
    args.push.apply(args, [
      '-v', `${process.cwd()}:${options.containerDest}`
    ])
  }

  if(options.include) {
    const relativeMounts = options.include.split(',')
      .reduce((prev, relativeDir) => {
        const hostPath = normalize(`${process.cwd()}/${relativeDir}`);
        return prev.concat('-v', `${hostPath}:${options.containerDest}/${relativeDir}`)
      }, [] as string[])

    args.push.apply(args, relativeMounts);
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
