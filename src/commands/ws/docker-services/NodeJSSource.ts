import {RepoInfo} from "../../../types";

export class NodeJSSource implements RepoInfo {
  constructor(
    public url: string,
    public init: string = 'yarn install && yarn build'
  ) {}
}