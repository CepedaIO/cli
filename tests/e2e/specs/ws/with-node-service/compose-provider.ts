//@ts-ignore
import {NodeJSService} from "@vlegm/cli";

export const server = NodeJSService(3000)
	.setSource(`git@github.com:vlegm/cli-server.git`);