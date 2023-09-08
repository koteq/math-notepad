import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";

/** @type {import('rollup').RollupOptions} */
export default {
  input: "src/main.ts",
  output: {
    file: "public/build/bundle.js",
    format: "iife",
  },
  plugins: [resolve({ browser: true }), commonjs(), typescript()],
};
