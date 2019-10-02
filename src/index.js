"use strict";
import ErrorStackParser from "error-stack-parser";
/**
 * @typedef {Object} IdentOptions
 * @property {string} [label]       - a string to proceed the value being logged
 * @property {boolean} [lineNumber] - a boolean indicating of the label should include the line number `ident` was called on
 */

/**
 * This function uses Error().stack to pull the place to get the line number `logIdent` was called on
 * since the reported line number will be where `console.log` is called
 *
 * @returns {string} - file and line number where `tap` was called
 */
const getLocation = () => {
  const stack = ErrorStackParser.parse(new Error());
  const { lineNumber, fileName } = stack[2];
  return ` - ${fileName.replace(/^(.*?)([^\/]+)$/, "$2")}:${lineNumber}`;
};

/**
 *
 * @param logFuncName
 * @returns {function(*, *=): *}
 */
const logTapPrep = (logFuncName = "log") => (
  value,
  options = { label: "", location: true }
) => {
  const output = [
    typeof options === "string" ? options : options.label,
    value,
    options.location ? getLocation() : undefined
  ].filter(v => v);

  console[logFuncName](...output);
  return value;
};

/**
 * Takes in a value, logs the value, then returns the value.
 * All of the `console` functions return `undefined`, meaning you have to rework expressive code to log something.
 * This function lets you log inline with all of your Expressions.
 *
 * @param {*} v
 * @param {IdentOptions} opt
 * @returns {*}
 */
export const logTap = logTapPrep();

const fullConsole = Object.entries(console).reduce((acc, [name, func]) => {
  acc[name] =
    typeof func !== "function" || func.tap
      ? func
      : Object.defineProperty(func, "tap", {
          enumerable: false,
          value: logTapPrep(name)
        });
  return acc;
}, Object.defineProperty({}, "tap", { enumerable: false, value: tapMacro }));

export default fullConsole;
