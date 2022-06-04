import { Command } from "commander";
import * as path from "path";

export type RegisterCallback = (program: Command) => Command;
export interface CommandInitiator {
  nameAndArgs: string,
  cb: RegisterCallback
}

const initiators: CommandInitiator[] = [];

export function register(nameAndArgs: string, cb: RegisterCallback) {
  initiators.push({ nameAndArgs, cb });
}

export function buildProgram(rootDir: string, order: string[]): Command {
  let program = new Command();

  order.forEach((commandName) => {
    require(path.resolve(`${rootDir}/${commandName}`));
  });

  order.map((commandName) =>
    initiators.find((command) => command.nameAndArgs.includes(commandName))!
  ).forEach((initiator: CommandInitiator) => {
    initiator.cb(program.command(initiator.nameAndArgs))
  })

  return program;
}