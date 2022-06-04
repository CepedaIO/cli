import {NodeJSService} from "../../../../src";
import {normalize} from "path";

/*
export const postgres = new PostgresService({
  POSTGRES_HOST: 'postgres',
  POSTGRES_PORT: 5432,
  POSTGRES_DB: 'event-matcher',
  POSTGRES_USER: 'superuser',
  POSTGRES_PASSWORD: 'password'
});*/

export const server = new NodeJSService(3000);
server.addSource(normalize(`${process.cwd()}/../repos/server`));
