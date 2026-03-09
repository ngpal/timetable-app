import { jest } from '@jest/globals';

// Suppress console outputs during tests to keep the console clean
beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'info').mockImplementation(() => {});
});

afterAll(() => {
    jest.restoreAllMocks();
});
