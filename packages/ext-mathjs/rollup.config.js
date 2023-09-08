import typescript from "@rollup/plugin-typescript";
import packageJson from "./package.json" assert { type: "json" };

/** @type {import('rollup').RollupOptions} */
export default {
  input: "src/index.ts",
  output: [
    { file: "lib/esm/index.js", format: "es" },
    { file: "lib/cjs/index.cjs", format: "cjs" },
  ],
  external: [
    ...Object.keys(packageJson.dependencies),
    ...Object.keys(packageJson.devDependencies),
  ],
  plugins: [typescript()],
};
