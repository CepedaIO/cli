//@ts-ignore
import {NodeJS} from "@cepedaio/cli";

export const server = NodeJS(3000)
	.source(`git@github.com:cepedaio/cli-server.git`, { init: 'yarn install' });
