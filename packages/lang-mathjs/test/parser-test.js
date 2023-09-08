import { fileTests } from "@lezer/generator/test";
import { mathjsLanguage } from '../lib/esm/index.js';

import * as fs from "node:fs";
import * as url from "node:url";
import * as path from "node:path";
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

for (let file of fs.readdirSync(__dirname)) {
  if (!file.endsWith(".txt")) continue;

  describe(path.basename(file, ".txt"), () => {
    for (let { name, run } of fileTests(
      fs.readFileSync(path.join(__dirname, file), "utf8"),
      file
    )) {
      it(name, () => run(mathjsLanguage.parser));
    }
  });
}
