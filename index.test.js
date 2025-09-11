const fs = require('fs');
const path = require('path');
const { scanForCdnScripts } = require('./index');

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

test('scans an HTML file and finds the correct CDN script tag', () => {
    const htmlContent = fs.readFileSync(path.join(__dirname, 'script_cdn_example.html'), 'utf8');
    const scriptTags = scanForCdnScripts(htmlContent);
    expect(scriptTags).toHaveLength(1);
    expect(scriptTags[0]).toBe('<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>');
});