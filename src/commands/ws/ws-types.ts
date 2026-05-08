import {NodeResolver} from "./services/resolvers/NodeResolver";
import {iProject} from "./models/Project";
import {Env} from "./docker";

export interface Context {
  linkProvider: NodeResolver;
  project: iProject;
  env: Env;
}
