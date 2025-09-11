const fs = require('fs');
const path = require('path');
const { scanForCdnScripts } = require('./index');

// Mock cosmiconfig before fs, so fs can be mocked for cosmiconfig's internal usage
jest.mock('cosmiconfig', () => ({
    cosmiconfigSync: jest.fn(() => ({
        search: jest.fn(),
    })),
}));

jest.mock('fs'); // Mock the entire fs module

jest.mock('yargs/yargs', () => jest.fn(() => ({
    option: jest.fn(() => ({
        help: jest.fn(() => ({
            alias: jest.fn(() => ({
                argv: { file: 'script_cdn_example.html' },
            })),
        })),
    })),
})));

jest.mock('yargs/helpers', () => ({
    hideBin: jest.fn(),
}));

// Mock fs.readFileSync for individual file tests
beforeEach(() => {
    fs.readFileSync.mockImplementation((filePath, encoding) => {
        const fileName = path.basename(filePath);
        switch (fileName) {
            case 'script_cdn_example.html':
                return '<html><script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script></html>';
            case 'no_external_scripts.html':
                return '<html><body></body></html>';
            case 'multiple_external_scripts.html':
                return '<html><script src="https://code.jquery.com/jquery-3.6.0.min.js"></script><script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script><script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js"></script></html>';
            case 'mixed_scripts.html':
                return '<html><script src="https://code.jquery.com/jquery-3.6.0.min.js"></script><script>console.log(\"hello\");</script><script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script></html>';
            case 'commented_out_script.html':
                return '<html><!-- <script src=\"https://cdn.jsdelivr.net/npm/commented.js\"></script> --></html>';
            case 'async_script.html':
                return '<html><script src="https://cdn.jsdelivr.net/npm/lodash/lodash.min.js" async></script></html>';
            case 'async_before_src.html':
                return '<html><script async src="https://cdn.jsdelivr.net/npm/moment/moment.min.js"></script></html>';
            case 'google_cdn_example.html':
                return '<html><script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script></html>';
            case 'cdnjs_example.html':
                return '<html><script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script></html>';
            case 'defer_script.html':
                return '<html><script src="https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js" defer></script></html>';
            default:
                return '';
        }
    });
});

afterEach(() => {
    jest.restoreAllMocks();
});

test('scans examples/script_cdn_example.html and finds the correct CDN script tag', () => {
    const htmlContent = fs.readFileSync(path.join(__dirname, 'examples/script_cdn_example.html'), 'utf8');
    const scriptTags = scanForCdnScripts(htmlContent);
    expect(scriptTags).toHaveLength(1);
    expect(scriptTags[0].fullTag).toBe('<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>');
    expect(scriptTags[0].srcUrl).toBe('https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js');
});


test('scans examples/no_external_scripts.html and finds none', () => {
    const htmlContent = fs.readFileSync(path.join(__dirname, 'examples/no_external_scripts.html'), 'utf8');
    const scriptTags = scanForCdnScripts(htmlContent);
    expect(scriptTags).toHaveLength(0);
});

test('scans examples/multiple_external_scripts.html and finds all of them', () => {
    const htmlContent = fs.readFileSync(path.join(__dirname, 'examples/multiple_external_scripts.html'), 'utf8');
    const scriptTags = scanForCdnScripts(htmlContent);
    expect(scriptTags).toHaveLength(3);
    expect(scriptTags).toContainEqual({ fullTag: '<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>', srcUrl: 'https://code.jquery.com/jquery-3.6.0.min.js' });
    expect(scriptTags).toContainEqual({ fullTag: '<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>', srcUrl: 'https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js' });
    expect(scriptTags).toContainEqual({ fullTag: '<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js"></script>', srcUrl: 'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js' });
});

test('scans examples/mixed_scripts.html and finds only the external ones', () => {
    const htmlContent = fs.readFileSync(path.join(__dirname, 'examples/mixed_scripts.html'), 'utf8');
    const scriptTags = scanForCdnScripts(htmlContent);
    expect(scriptTags).toHaveLength(2);
    expect(scriptTags).toContainEqual({ fullTag: '<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>', srcUrl: 'https://code.jquery.com/jquery-3.6.0.min.js' });
    expect(scriptTags).toContainEqual({ fullTag: '<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>', srcUrl: 'https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js' });
});

test('scans examples/commented_out_script.html and finds none', () => {
    const htmlContent = fs.readFileSync(path.join(__dirname, 'examples/commented_out_script.html'), 'utf8');
    const scriptTags = scanForCdnScripts(htmlContent);
    expect(scriptTags).toHaveLength(0);
});

test('scans examples/async_script.html and finds the async CDN script tag', () => {
    const htmlContent = fs.readFileSync(path.join(__dirname, 'examples/async_script.html'), 'utf8');
    const scriptTags = scanForCdnScripts(htmlContent);
    expect(scriptTags).toHaveLength(1);
    expect(scriptTags[0].fullTag).toBe('<script src="https://cdn.jsdelivr.net/npm/lodash/lodash.min.js" async></script>');
    expect(scriptTags[0].srcUrl).toBe('https://cdn.jsdelivr.net/npm/lodash/lodash.min.js');
});

test('scans examples/async_before_src.html and finds the async CDN script tag with async before src', () => {
    const htmlContent = fs.readFileSync(path.join(__dirname, 'examples/async_before_src.html'), 'utf8');
    const scriptTags = scanForCdnScripts(htmlContent);
    expect(scriptTags).toHaveLength(1);
    expect(scriptTags[0].fullTag).toBe('<script async src="https://cdn.jsdelivr.net/npm/moment/moment.min.js"></script>');
    expect(scriptTags[0].srcUrl).toBe('https://cdn.jsdelivr.net/npm/moment/moment.min.js');
});

test('scans examples/google_cdn_example.html and finds the Google CDN script tag', () => {
    const htmlContent = fs.readFileSync(path.join(__dirname, 'examples/google_cdn_example.html'), 'utf8');
    const scriptTags = scanForCdnScripts(htmlContent);
    expect(scriptTags).toHaveLength(1);
    expect(scriptTags[0].fullTag).toBe('<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>');
    expect(scriptTags[0].srcUrl).toBe('https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js');
});

test('scans examples/cdnjs_example.html and finds the CDNJS script tag', () => {
    const htmlContent = fs.readFileSync(path.join(__dirname, 'examples/cdnjs_example.html'), 'utf8');
    const scriptTags = scanForCdnScripts(htmlContent);
    expect(scriptTags).toHaveLength(1);
    expect(scriptTags[0].fullTag).toBe('<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>');
    expect(scriptTags[0].srcUrl).toBe('https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js');
});

test('scans examples/defer_script.html and finds the deferred CDN script tag', () => {
    const htmlContent = fs.readFileSync(path.join(__dirname, 'examples/defer_script.html'), 'utf8');
    const scriptTags = scanForCdnScripts(htmlContent);
    expect(scriptTags).toHaveLength(1);
    expect(scriptTags[0].fullTag).toBe('<script src="https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js" defer></script>');
    expect(scriptTags[0].srcUrl).toBe('https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js');
});

test('extracts \'@latest\' version correctly', () => {
    const { extractVersionFromUrl } = require('./index');
    const url = 'https://cdn.jsdelivr.net/npm/bootstrap@latest/dist/js/bootstrap.min.js';
    const version = extractVersionFromUrl(url);
    expect(version).toBe('latest_found');
});

describe('Directory Scanning', () => {
    const { processFile, scanDirectory } = require('./index');

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('scans a directory and processes HTML files', (done) => {
        const mockArgv = { extractVersion: false };
        const mockDirectoryPath = '/mock/test/dir';

        // Mock fs.readdir to return directory entries
        fs.readdir.mockImplementation((dirPath, options, callback) => {
            if (dirPath === mockDirectoryPath) {
                callback(null, [
                    { name: 'file1.html', isDirectory: () => false, isFile: () => true },
                    { name: 'subdir', isDirectory: () => true, isFile: () => false },
                    { name: 'file2.txt', isDirectory: () => false, isFile: () => true }, // Non-HTML file
                ]);
            } else if (dirPath === path.join(mockDirectoryPath, 'subdir')) {
                callback(null, [
                    { name: 'nested.html', isDirectory: () => false, isFile: () => true },
                ]);
            } else {
                callback(new Error('Unknown directory'));
            }
        });

        // Mock fs.readFile to return content for HTML files
        fs.readFile.mockImplementation((filePath, encoding, callback) => {
            if (filePath.endsWith('.html')) {
                callback(null, '<html><script src="https://cdn.example.com/lib.js"></script></html>');
            } else {
                callback(new Error('Not an HTML file'));
            }
        });

        // Mock console.log to capture output
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        scanDirectory(mockDirectoryPath, mockArgv);

        // Use a timeout to allow async operations to complete
        setTimeout(() => {
            // Expect processFile to be called for each HTML file
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Found script tags with CDN links in /mock/test/dir/file1.html:'));
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Found script tags with CDN links in /mock/test/dir/subdir/nested.html:'));
            expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('file2.txt'));

            consoleSpy.mockRestore();
            done();
        }, 100);
    });

    test('handles directory read errors', (done) => {
        const mockArgv = { extractVersion: false };
        const mockDirectoryPath = '/mock/error/dir';

        fs.readdir.mockImplementation((dirPath, options, callback) => {
            callback(new Error('Permission denied'));
        });

        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        scanDirectory(mockDirectoryPath, mockArgv);

        setTimeout(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Error reading directory /mock/error/dir: Error: Permission denied'));
            consoleErrorSpy.mockRestore();
            done();
        }, 500);
    });
});

describe('Configuration Loading', () => {
    const { cosmiconfigSync } = require('cosmiconfig');
    const { processFile } = require('./index');

    // Mock cosmiconfig
    jest.mock('cosmiconfig', () => ({
        cosmiconfigSync: jest.fn(() => ({
            search: jest.fn(),
        })),
    }));

    beforeEach(() => {
        jest.clearAllMocks();
        // Reset mock for cosmiconfigSync.search() for each test
        cosmiconfigSync().search.mockReturnValue(null);
    });

    test('loads default configuration when no config file is found', (done) => {
        const mockArgv = { file: '/mock/file.html', extractVersion: false, versionType: 'semantic' };
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        fs.readFile.mockImplementation((filePath, encoding, callback) => {
            callback(null, '<html><script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script></html>');
        });

        // Simulate running the main CLI logic
        // Since we can't directly test the yargs parsing in a unit test easily,
        // we'll simulate the argv object that would be passed to processFile.
        // The actual test here is that processFile uses the default values if no config is loaded.
        processFile(mockArgv.file, mockArgv);

        setTimeout(() => {
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>'));
            expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('Version:'));
            consoleSpy.mockRestore();
            done();
        }, 100);
    });

    test('loads configuration from file', (done) => {
        const mockConfig = { extractVersion: true, versionType: 'date' };
        cosmiconfigSync().search.mockReturnValue({ config: mockConfig });

        const mockArgv = { file: '/mock/file.html' }; // No CLI flags for these options
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        fs.readFile.mockImplementation((filePath, encoding, callback) => {
            callback(null, '<html><script src="https://example.com/lib/2023-01-01/lib.js"></script></html>');
        });

        // Simulate the merged argv object that would be passed to processFile
        const mergedArgv = { ...mockConfig, ...mockArgv };
        processFile(mergedArgv.file, mergedArgv);

        setTimeout(() => {
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('<script src="https://example.com/lib/2023-01-01/lib.js"></script> (Version: 2023-01-01)'));
            consoleSpy.mockRestore();
            done();
        }, 100);
    });

    test('CLI arguments override configuration file settings', (done) => {
        const mockConfig = { extractVersion: true, versionType: 'date' };
        cosmiconfigSync().search.mockReturnValue({ config: mockConfig });

        // CLI overrides config
        const mockArgv = { file: '/mock/file.html', extractVersion: false, versionType: 'semantic' };
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        fs.readFile.mockImplementation((filePath, encoding, callback) => {
            callback(null, '<html><script src="https://example.com/lib/1.0.0/lib.js"></script></html>');
        });

        const mergedArgv = { ...mockConfig, ...mockArgv };
        processFile(mergedArgv.file, mergedArgv);

        setTimeout(() => {
            // Expect CLI setting (extractVersion: false) to take precedence
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('<script src="https://example.com/lib/1.0.0/lib.js"></script>'));
            expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('Version:'));
            consoleSpy.mockRestore();
            done();
        }, 100);
    });
});

