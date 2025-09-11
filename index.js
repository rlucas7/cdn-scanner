#!/usr/bin/env node

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const fs = require('fs');

function extractVersionFromUrl(url) {
    // Regex to capture common version patterns in URLs
    const versionRegex = /(?:\/v?(\d+(?:\.\d+){0,2}(?:[\w.-]+)?)(?:\/|$)|@(\d+(?:\.\d+){0,2}(?:[\w.-]+)?)(?:\/|$))/;
    const match = url.match(versionRegex);
    if (match) {
        return match[1] || match[2]; // Return the captured group
    }
    return null;
}

function scanForCdnScripts(data) {
    const withoutComments = data.replace(/<!--[\s\S]*?-->/g, '');
    const scriptTagRegex = /<script\s+[^>]*src="(https?s?:\/\/[^">]+)"[^>]*><\/script>/g;
    let match;
    const cdnScripts = [];

    while ((match = scriptTagRegex.exec(withoutComments)) !== null) {
        const fullTag = match[0];
        const srcUrl = match[1];
        cdnScripts.push({ fullTag, srcUrl });
    }
    return cdnScripts;
}

if (require.main === module) {
    const argv = yargs(hideBin(process.argv))
        .option('file', {
            alias: 'f',
            description: 'Input file to scan',
            type: 'string',
            demandOption: true,
        })
        .option('extract-version', {
            alias: 'v',
            description: 'Extracts version from CDN URLs if available',
            type: 'boolean',
            default: false,
        })
        .help()
        .alias('help', 'h')
        .argv;

    const filePath = argv.file;

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading file: ${err}`);
            return;
        }

        const cdnScripts = scanForCdnScripts(data);
        if (cdnScripts.length > 0) {
            console.log('Found script tags with CDN links:');
            cdnScripts.forEach(script => {
                let output = script.fullTag;
                if (argv.extractVersion) {
                    const version = extractVersionFromUrl(script.srcUrl);
                    if (version) {
                        output += ` (Version: ${version})`;
                    } else {
                        output += ' (Version: Not found)';
                    }
                }
                console.log(output);
            });
        } else {
            console.log('No script tags with CDN links found.');
        }
    });
}

module.exports = { scanForCdnScripts, extractVersionFromUrl };