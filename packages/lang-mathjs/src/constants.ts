import type { Completion } from "@codemirror/autocomplete";

// https://raw.githubusercontent.com/josdejong/mathjs/v11.10.1/docs/reference/constants.md
// copy(JSON.stringify(Array.from(document.body.textContent.matchAll(/^(.*?)\|(.*?)\|(.*?)$/gm)).slice(2).flatMap(([, cc, d]) => cc.split(',').map((c) => ({ label: c.trim().replace(/`/g, ''), type: "constant", info: d.trim().replace(/`/g, '') })))))
export const constants: Completion[] = [
  {
    label: "e",
    type: "constant",
    info: "Euler's number, the base of the natural logarithm.",
  },
  {
    label: "E",
    type: "constant",
    info: "Euler's number, the base of the natural logarithm.",
  },
  {
    label: "i",
    type: "constant",
    info: "Imaginary unit, defined as i * i = -1. A complex number is described as a + b * i, where a is the real part, and b is the imaginary part.",
  },
  {
    label: "Infinity",
    type: "constant",
    info: "Infinity, a number which is larger than the maximum number that can be handled by a floating point number.",
  },
  {
    label: "LN2",
    type: "constant",
    info: "Returns the natural logarithm of 2.",
  },
  {
    label: "LN10",
    type: "constant",
    info: "Returns the natural logarithm of 10.",
  },
  {
    label: "LOG2E",
    type: "constant",
    info: "Returns the base-2 logarithm of E.",
  },
  {
    label: "LOG10E",
    type: "constant",
    info: "Returns the base-10 logarithm of E.",
  },
  { label: "NaN", type: "constant", info: "Not a number." },
  { label: "null", type: "constant", info: "Value null." },
  {
    label: "phi",
    type: "constant",
    info: "Phi is the golden ratio. Two quantities are in the golden ratio if their ratio is the same as the ratio of their sum to the larger of the two quantities. Phi is defined as (1 + sqrt(5)) / 2",
  },
  {
    label: "pi",
    type: "constant",
    info: "The number pi is a mathematical constant that is the ratio of a circle's circumference to its diameter.",
  },
  {
    label: "PI",
    type: "constant",
    info: "The number pi is a mathematical constant that is the ratio of a circle's circumference to its diameter.",
  },
  {
    label: "SQRT1_2",
    type: "constant",
    info: "Returns the square root of 1/2.",
  },
  { label: "SQRT2", type: "constant", info: "Returns the square root of 2." },
  {
    label: "tau",
    type: "constant",
    info: "Tau is the ratio constant of a circle's circumference to radius, equal to 2 * pi.",
  },
  {
    label: "undefined",
    type: "constant",
    info: "An undefined value. Preferably, use null to indicate undefined values.",
  },
  {
    label: "version",
    type: "constant",
    info: "Returns the version number of math.js.",
  },
];
