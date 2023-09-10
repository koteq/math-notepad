import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import postcss from "rollup-plugin-postcss";

/** @type {import('rollup').RollupOptions} */
export default {
  input: "src/main.ts",
  output: {
    file: "public/build/bundle.js",
    format: "iife",
  },
  plugins: [
    postcss({ extract: true }),
    resolve({ browser: true }),
    commonjs(),
    typescript(),
  ],
};
