import logger, { logTap, polyfill } from './index';
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
