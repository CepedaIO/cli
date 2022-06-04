//@ts-ignore
import {NodeJSService} from "@vlegm/cli";
import {normalize} from "path";

export const server = new NodeJSService(3000);
server.addSource(normalize(`${__dirname}/../../../tests/e2e/repos/server`));
