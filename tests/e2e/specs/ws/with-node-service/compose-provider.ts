//@ts-ignore
import {NodeJS, Env} from "@cepedaio/cli";

export const local = new Env();

export const server = NodeJS({
    url: `git@github.com:cepedaio/cli-server.git`,
    init: 'npm install'
}).env(local, ({service}) => {
    service.port(3000);
})

