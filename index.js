#!/usr/bin/env node

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const fs = require('fs');

function scanForCdnScripts(data) {
    const withoutComments = data.replace(/<!--[\s\S]*?-->/g, '');
    const scriptTags = withoutComments.match(/<script\s+[^>]*src="https?s?:\/\/[^>]*><\/script>/g);
    return scriptTags || [];
}

if (require.main === module) {
    const argv = yargs(hideBin(process.argv))
        .option('file', {
            alias: 'f',
            description: 'Input file to scan',
            type: 'string',
            demandOption: true,
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

        const scriptTags = scanForCdnScripts(data);
        if (scriptTags.length > 0) {
            console.log('Found script tags with CDN links:');
            scriptTags.forEach(tag => {
                console.log(tag);
            });
        } else {
            console.log('No script tags with CDN links found.');
        }
    });
}

module.exports = { scanForCdnScripts };