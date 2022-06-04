import {iProject} from "../models/Project";
import {ComposeProvider} from "../../../types";

export function providerFromProject(project: iProject): ComposeProvider {
  return require(`${project.root}/dist/compose-provider.js`).default;
}