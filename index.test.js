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
    const htmlContent = fs.readFileSync(path.join(__dirname, 'examples/script_cdn_example.html'), 'utf8');
    const scriptTags = scanForCdnScripts(htmlContent);
    expect(scriptTags).toHaveLength(1);
    expect(scriptTags[0]).toBe('<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>');
});

test('scans an HTML file with no external scripts and finds none', () => {
    const htmlContent = fs.readFileSync(path.join(__dirname, 'examples/no_external_scripts.html'), 'utf8');
    const scriptTags = scanForCdnScripts(htmlContent);
    expect(scriptTags).toHaveLength(0);
});

test('scans an HTML file with multiple external scripts and finds all of them', () => {
    const htmlContent = fs.readFileSync(path.join(__dirname, 'examples/multiple_external_scripts.html'), 'utf8');
    const scriptTags = scanForCdnScripts(htmlContent);
    expect(scriptTags).toHaveLength(3);
    expect(scriptTags).toContain('<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>');
        expect(scriptTags).toContain('<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>');
    expect(scriptTags).toContain('<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js"></script>');
});

test('scans an HTML file with mixed internal and external scripts and finds only the external ones', () => {
    const htmlContent = fs.readFileSync(path.join(__dirname, 'examples/mixed_scripts.html'), 'utf8');
    const scriptTags = scanForCdnScripts(htmlContent);
    expect(scriptTags).toHaveLength(2);
    expect(scriptTags).toContain('<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>');
    expect(scriptTags).toContain('<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>');
});

test('scans an HTML file with a commented out external script and finds none', () => {
    const htmlContent = fs.readFileSync(path.join(__dirname, 'examples/commented_out_script.html'), 'utf8');
    const scriptTags = scanForCdnScripts(htmlContent);
    expect(scriptTags).toHaveLength(0);
});