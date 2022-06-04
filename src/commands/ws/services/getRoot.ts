import { join } from "path";

export function getRoot(name:string): string {
  return join(process.cwd(), name);
}
