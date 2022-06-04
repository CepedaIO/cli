import { register } from "../../utils/register";
import { Command } from "commander";
import { init } from "./commands/init";
import { projects } from './commands/projects';
import {remove} from "./commands/remove";
import { defaultProject } from "./commands/default";
import { start } from "./commands/start";
import { stop } from "./commands/stop";
import {unpack} from "./commands/unpack";
import { exec } from "./commands/exec";
import {tail} from "./commands/tail";
import {restart} from "./commands/restart";
import {exclude} from "./commands/exclude";
import {include} from "./commands/include";

register('ws', (program: Command) => {
  program.description('Workstation tool helps you set up docker environments')

  program.command('start [service] [project]')
    .description('Start docker service(s)')
    .option('-b, --build', "Force project to build itself", false)
    .option('-g, --generate', "Only generate startup files, do not start", false)
    .action(start);

  program.command('restart [service] [project]')
    .description('Restart service')
    .action(restart);

  program.command('exec <service> <command> [project]')
    .description('Exec command in service\'s container')
    .action(exec);

  program.command('tail <service> [project]')
    .description('Tail logs for service')
    .option('-p, --peek', 'Just peek at, do not tail logs', false)
    .action(tail);

  program.command('stop [service] [project]')
    .description('Stop docker services')
    .action(stop);

  program.command('exclude [service] [project]')
    .description('Exclude service for future builds')
    .action(exclude);

  program.command('include [service] [project]')
    .description('Include a previously excluded service for future builds')
    .action(include);

  program.command('init <project>')
    .description('Initialize a new project')
    .action(init);

  program.command('unpack [project]')
    .description('Unpack a project from existing compose-provider.ts')
    .action(unpack);

  program.command('default [project]')
    .description('Get/Set the default project for commands')
    .action(defaultProject);

  program.command('projects')
    .description('Output all of the currently registered projects')
    .action(projects);

  program.command('remove <project>')
    .description('Removes reference and record of project')
    .action(remove);

  return program;
});
