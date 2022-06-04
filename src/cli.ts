#!/usr/bin/env node
import { buildProgram } from './utils/register';
import { srcDir } from './config/app';
import {init} from "./scripts/init";

init().then(() => {
  const program = buildProgram(`${srcDir}/commands`, ['shell', 'ws', 'vue']);

  program.parseAsync(process.argv)
    .catch(console.error);
});
