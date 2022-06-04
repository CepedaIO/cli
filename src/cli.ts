import {init} from "./scripts/init";
import {buildProgram} from "./utils/register";
import {rootDir} from "./config/app";

init().then(() => {
  const program = buildProgram(`${rootDir}/commands`, ['shell', 'ws', 'vue']);

  program.parseAsync(process.argv)
    .catch(console.error);
});
