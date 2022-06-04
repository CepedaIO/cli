import {createTemplateData} from "./createTemplateData";
import {readFileSync} from "fs";
import {assetsDir} from "../../../../configs/app";
import {render} from "ejs";
import {WorkstationAnswers} from "../../../../types";

export async function createComposeProvider(config: WorkstationAnswers) {
    const data = createTemplateData(config);
    const template = readFileSync(`${assetsDir}/compose-provider.ts.ejs`, 'utf-8');
    return render(template, data);
}
