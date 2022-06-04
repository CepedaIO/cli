import { normalize } from "path";

export function getRoot(name:string): string {
  return normalize(`${process.cwd()}/${name}`);
}