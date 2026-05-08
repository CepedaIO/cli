import {existsSync} from "fs";

export enum PackageManagers {
    NPM = "npm",
    Yarn = "yarn",
}

export class CommandManager implements CommandManager {
    constructor(private readonly packageManager: PackageManagers) {

    }

    run(command:string): string {
        return `${this.packageManager} run ${command}`;
    }

    static createFor(dir:string) {
        if(existsSync(`${dir}/package-lock.json`)) {
            return new CommandManager(PackageManagers.NPM);
        } else if(existsSync(`${dir}/yarn.json`)) {
            return new CommandManager(PackageManagers.Yarn);
        }

        throw new Error(`Unable to create ClassManager for ${dir}`);
    }
}