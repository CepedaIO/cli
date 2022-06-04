#!/usr/bin/env node
import { buildProgram } from './utils/register';
import { rootDir } from './config/app';
import {init} from "./scripts/init";

init().then(() => {
  const program = buildProgram(`${rootDir}/commands`, ['shell', 'ws', 'vue']);

  program.parseAsync(process.argv)
    .catch(console.error);
});

export * from "./types";
export * from "./commands/ws/docker-services";
export { composer } from "./commands/ws/services/composer";