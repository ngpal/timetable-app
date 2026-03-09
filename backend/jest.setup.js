// Suppress console outputs during tests to keep the console clean
beforeAll(() => {
    global.originalConsoleError = console.error;
    global.originalConsoleWarn = console.warn;
    global.originalConsoleLog = console.log;
    global.originalConsoleInfo = console.info;

    console.error = () => { };
    console.warn = () => { };
    console.log = () => { };
    console.info = () => { };
});

afterAll(() => {
    if (global.originalConsoleError) console.error = global.originalConsoleError;
    if (global.originalConsoleWarn) console.warn = global.originalConsoleWarn;
    if (global.originalConsoleLog) console.log = global.originalConsoleLog;
    if (global.originalConsoleInfo) console.info = global.originalConsoleInfo;
});
