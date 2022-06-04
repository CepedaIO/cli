import {spawn, SpawnOptionsWithoutStdio} from "child_process";

export async function passthru(command: string, args: string[], spawnOptions?: SpawnOptionsWithoutStdio) {
  const options:SpawnOptionsWithoutStdio = {
    stdio: 'pipe',
    ...spawnOptions
  };

  const child = spawn(command, args, options);

  return new Promise((resolve, reject) => {
    child.on('exit', (code) => resolve(code));
    child.on('error', (err) => reject(err))
  });
}
