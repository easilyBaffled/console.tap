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

describe('logTap', () => {
    beforeAll(() => {
        createProxyConsole();
    });

    afterAll(() => {
        cleanUpProxyConsole();
    });

    test('returns the value', () => {
        const expected = 'value';
        const actual = logTap('value');
        expect(actual).toEqual(expected);
    });

    test('logs the value', () => {
        logTap('value');
        const expected = 'value';
        const actual = console.recordedLogs[0].args[0];
        expect(actual).toEqual(expected);
    });
});

describe('logger.log.tap', () => {
    beforeAll(() => {
        createProxyConsole();
    });

    afterAll(() => {
        cleanUpProxyConsole();
    });

    test('returns the value', () => {
        const expected = 'value';
        const actual = logger.log.tap('value');
        expect(actual).toEqual(expected);
    });

    test('logs the value', () => {
        logger.log.tap('value');
        const expected = 'value';
        const actual = console.recordedLogs[0].args[0];
        expect(actual).toEqual(expected);
    });
});

describe('logger.log.tap', () => {
    beforeAll(() => {
        createProxyConsole();
    });

    afterAll(() => {
        cleanUpProxyConsole();
    });

    test('returns the value', () => {
        const expected = 'value';
        const actual = logger.tap('value');
        expect(actual).toEqual(expected);
    });

    test('logs the value', () => {
        logger.tap('value');
        const expected = 'value';
        const actual = console.recordedLogs[0].args[0];
        expect(actual).toEqual(expected);
    });
});

describe('polyfill', () => {
    beforeAll(() => {
        polyfill();
        createProxyConsole();
    });

    afterAll(() => {
        cleanUpProxyConsole();
    });

    test('returns the value', () => {
        const expected = 'value';
        const actual = console.tap('value');
        expect(actual).toEqual(expected);
    });

    test('logs the value', () => {
        console.tap('value');
        const expected = 'value';
        const actual = console.recordedLogs[0].args[0];
        expect(actual).toEqual(expected);
    });
});
