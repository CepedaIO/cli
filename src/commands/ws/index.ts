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


register('ws', (program: Command) => {
  program.description('Workstation tool helps you set up docker environments')

  program.command('start [project] [environment]')
    .description('Start docker services')
    .option('-b, --build', "Force project to build itself")
    .option('-g, --generate', "Only generate startup files, do not start")
    .action(start);

  program.command('exec <service> <command> [project]')
    .description('Exec command in service\'s container')
    .action(exec);

  program.command('stop [project]')
    .description('Stop docker services')
    .action(stop);

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
