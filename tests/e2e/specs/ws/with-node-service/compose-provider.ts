//@ts-ignore
import {NodeJSService} from "@cepedaio/cli";

export const server = NodeJSService(3000)
	.setSource(`git@github.com:cepedaio/cli-server.git`);