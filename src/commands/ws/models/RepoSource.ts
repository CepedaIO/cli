import {RepoInfo, ShellCommand} from "../../../types";

export function RepoSource(url: string, init: ShellCommand): RepoInfo {
  return { url, init }
}