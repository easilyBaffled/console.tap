// Simple
// console.ident = v => (console.log(v), v);

/**
 * @typedef {Object} IdentOptions
 * @property {string} [label] - a string to proceed the value being logged
 * @property {boolean} [lineNumber] - a boolean indicating of the label should include the line number `ident` was called on
 * @property {boolean} [fileName] - a boolean indicating of the label should include the name of the file `ident` was called in
 */

/**
 * This function uses Error().stack to pull the place to get the line number `logIdent` was called on
 * since the reported line number will be where `console.log` is called
 * @param {string} stack - the result of Error().stack
 * @returns {string} - line number where `ident` was called
 */
const extractLineNumber = stack =>
    /:(\d+)/.exec(stack.split('\n')[2])[0];

/**
 * Takes in a value, logs the value, then returns the value.
 * All of the `console` functions return `undefined`, meaning you have to rework expressive code to log something.
 * This function lets you log inline with all of your Expressions.
 *
 * @param {T} v
 * @param {IdentOptions} opt
 * @returns {T}
 */
export const logIdent = (
    v,
    opt = { label: '', lineNumber: false, fileName: false }
) => {
    const label =
        typeof opt === 'string'
            ? opt
            : `${opt.label}${
                opt.lineNumber
                    ? extractLineNumber(Error().stack)
                    : ''
                }`;

    navigator.userAgent.includes('Chrome')
        ? console.log(
            `%c${label}`,
            'background:black;color:white;border-radius:5px;padding:1px',
            v
        )
        : console.log(label, v);

    return v;
};

export default Object.assign(
    { ident: logIdent },
    console // In case you don't want to use the polyfill form, but want all of the logging function as one object
);

export const ident = logIdent;

/**
 * Ad the `ident` logging function to the global `console` object.
 * @returns {function(T, Object=): T}
 */
export const polyfill = () => (console.ident = logIdent);
