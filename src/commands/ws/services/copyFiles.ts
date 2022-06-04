import {basename} from "path";
import {copyFile} from "fs/promises";
import {existsSync} from "fs";

export async function copyFiles(urls: string[], dest:string) {
  return Promise.all(urls.map((url) => {
    const fileDest = `${dest}/${basename(url)}`;

    if(!existsSync(fileDest)) {
      return copyFile(url, fileDest);
    }
  }));
}