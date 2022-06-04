import chalk = require('chalk');

export function log1(a: string) {
  console.log(`${chalk.yellowBright(a)}`);
}

export function log2(a: string, b: string) {
  console.log(`${chalk.greenBright(a)}: ${chalk.whiteBright(b)}`);
}

export function verbose(...args:string[]) {
  console.log(`${chalk.grey(...args)}`);
}
