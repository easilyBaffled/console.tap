import logger, { logTap, polyfill } from '..';
const pluginTester = require("babel-plugin-tester");
const plugin = require("babel-plugin-macros");
const prettier = require("prettier");

const originalConsole = console;

const createProxyConsole = () => {
    console = new Proxy(
        { ...console, recordedLogs: [] },
        {
            get(target, name) {
                if (name === 'recordedLogs') return target.recordedLogs;
                return (...args) => {
                    target.recordedLogs.push({ name, args });
                    return target[name](...args);
                };
            }
        }
    );
};

const cleanUpProxyConsole = () => {
    console = originalConsole;
};

describe.each( [ logTap, logger.log.tap, logTap ] )( '%#', fn => {
    beforeAll(() => {
        createProxyConsole();
    });

    afterAll(() => {
        cleanUpProxyConsole();
    });

    test('returns the value', () => {
        const expected = 'value';
        const actual = fn('value');
        expect(actual).toEqual(expected);
    });

    test('logs the value', () => {
        fn('value');
        const expected = 'value';
        const actual = console.recordedLogs[0].args[0];
        expect(actual).toEqual(expected);
    });
} );



pluginTester({
    plugin,
    snapshot: true,
    babelOptions: {
        filename: __filename,
        retainLines: true,
    },
    formatResult(result) {
        return prettier.format(result, { trailingComma: "es5" });
    },
    tests: {
        "basic usage": `
      import macro from "../tap.macro";
      const result = macro(['1', '2', 'zero' , 3, 4, 5]
        .map( n => Number(n) || 0 ))
        .filter( n => n % 2)
        .reduce(( acc, v ) => Math.max(acc, v));
    `,
    },
});
