import {Application} from "../commands/ws/models/Application";
import {existsSync} from "fs";
import {dataDir} from "../config/app";
import {mkdir} from "fs/promises";

export async function init() {
  if(!existsSync(dataDir)) {
    await mkdir(dataDir);
    await Application.init();
  }
}