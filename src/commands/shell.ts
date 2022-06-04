import { run } from "@vlegm/utils";
import { register } from "../utils/register";
import { Command } from "commander";
import { homedir } from 'os';
import { normalize } from 'path';
import {log1, log2} from "../utils/log";

interface ShellOptions {
  cwdDest?: string // /mnt/host
  ssh?: boolean // false
  docker?: boolean // false
}

register('shell [image] [cmd]', (program: Command) => {
  return program.description('Attempt to shell into an image with an auto-removing container')
    .option('-c, --cwd-dest <dest>', "Designates where CWD is mounted within container", '/mnt/host')
    .option('-s, --ssh', "Mount SSH files", false)
    .option('-d, --docker', 'Mount Docker daemon', false)
    .action(shell);
});

export async function shell(image = 'vlegm/dev-alpine:latest', cmd = '/bin/zsh', options:ShellOptions = {}) {
  const sshDir = normalize(`${homedir()}/.ssh`);
  const cwd = process.cwd();
  log2('cmd', cmd);
  log2('image', image);

  const args = [
    '-it',
    '--rm',
    '-v', `${cwd}:${options.cwdDest}`
  ];

  if(options.docker === true) {
    log1('Injecting docker');
    args.push.apply(args, [
      '-v', `//var/run/docker.sock:/var/run/docker.sock`,
      '-v', `//var/run/docker.pid:/var/run/docker.pid`,
    ]);
  }

  if(options.ssh === true) {
    log1('Injecting SSH');
    args.push.apply(args, [
      '-v', `${sshDir}:/mnt/.ssh`
    ]);
  }

  await run('docker', [
    'run',
    ...args,
    image, cmd
  ]);
}
