import { lezer } from "@lezer/generator/rollup";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import postcss from "rollup-plugin-postcss";

const isRelative = (module) =>
  module.startsWith("/") || module.startsWith("./") || module.startsWith("../");

/** @type {typeof import("rollup").defineConfig} */
export default [
  {
    input: "packages/ext-mathjs/src/index.ts",
    output: [
      { file: "packages/ext-mathjs/lib/esm/index.js", format: "es" },
      { file: "packages/ext-mathjs/lib/cjs/index.cjs", format: "cjs" },
    ],
    external: (module) => !isRelative(module),
    plugins: [
      typescript({
        compilerOptions: {
          rootDir: "packages/ext-mathjs/src",
          declaration: true,
          declarationDir: "",
        },
      }),
    ],
  },
  {
    input: "packages/lang-mathjs/src/index.ts",
    output: [
      { file: "packages/lang-mathjs/lib/esm/index.js", format: "es" },
      { file: "packages/lang-mathjs/lib/cjs/index.cjs", format: "cjs" },
    ],
    external: (module) => !isRelative(module),
    plugins: [
      lezer(),
      typescript({
        compilerOptions: {
          rootDir: "packages/lang-mathjs/src",
          declaration: true,
          declarationDir: "",
        },
      }),
    ],
  },
  {
    input: "packages/math-notepad/src/main.ts",
    output: {
      file: "packages/math-notepad/public/build/bundle.js",
      format: "iife",
    },
    plugins: [
      postcss({ extract: true }),
      resolve({ browser: true }),
      commonjs(),
      typescript({
        compilerOptions: {
          rootDir: "packages/math-notepad/src",
          removeComments: true,
        },
      }),
    ],
  },
];
