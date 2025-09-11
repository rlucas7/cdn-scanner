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