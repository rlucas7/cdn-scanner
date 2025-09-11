#!/usr/bin/env node

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const fs = require('fs');
const path = require('path');
const { cosmiconfigSync } = require('cosmiconfig');

const moduleName = 'cdn-scanner';
const explorerSync = cosmiconfigSync(moduleName);

/**
 * Extracts a version number from a given URL, or identifies if '@latest' is used.
 * @param {string} url - The URL to extract the version from.
 * @param {string} versionType - The type of version to extract ('semantic' or 'date').
 * @returns {string|null} The extracted version string, 'latest_found', or null if no version is found.
 */
function extractVersionFromUrl(url, versionType) {
    // Check for '@latest' specifically
    if (url.includes('@latest')) {
        return 'latest_found';
    }

    let version;
    if (versionType === 'date') {
        // Regex for date-based versions (YYYYMMDD or YYYY-MM-DD)
        const dateVersionRegex = /(?:\/(\d{4}(?:-\d{2}){2}|\d{8})(?:\/|$))/;
        const match = url.match(dateVersionRegex);
        if (match) {
            version = match[1];
        }
    } else { // Default to semantic
        // Regex to capture common semantic version patterns in URLs
        const semanticVersionRegex = /(?:\/v?(\d+(?:\.\d+){0,2}(?:[\w.-]+)?)(?:\/|$)|@(\d+(?:\.\d+){0,2}(?:[\w.-]+)?)(?:\/|$))/;
        const match = url.match(semanticVersionRegex);
        if (match) {
            version = match[1] || match[2];
        }
    }
    return version || null;
}

/**
 * Scans HTML content for script tags that link to CDNs.
 * @param {string} data - The HTML content as a string.
 * @returns {Array<Object>} An array of objects, each containing the full script tag and its src URL.
 */
function scanForCdnScripts(data) {
    const withoutComments = data.replace(/<!--[\s\S]*?-->/g, '');
    const scriptTagRegex = /<script\s+[^>]*src="(https?:\/\/[^">]+)"[^>]*><\/script>/g;
    let match;
    const cdnScripts = [];

    while ((match = scriptTagRegex.exec(withoutComments)) !== null) {
        const fullTag = match[0];
        const srcUrl = match[1];
        cdnScripts.push({ fullTag, srcUrl });
    }
    return cdnScripts;
}

/**
 * Processes a single file to scan for CDN scripts and logs the results.
 * @param {string} filePath - The path to the file to process.
 * @param {Object} argv - The yargs arguments, including extractVersion flag.
 */
function processFile(filePath, argv) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading file ${filePath}: ${err}`);
            return;
        }

        const cdnScripts = scanForCdnScripts(data);
        if (cdnScripts.length > 0) {
            console.log(`\nFound script tags with CDN links in ${filePath}:`);
            cdnScripts.forEach(script => {
                let output = script.fullTag;
                if (argv.extractVersion) {
                    const version = extractVersionFromUrl(script.srcUrl, argv.versionType);
                    if (version === 'latest_found') {
                        output += ' (Version: @latest - Check CDN for specific version)';
                    } else if (version) {
                        output += ` (Version: ${version})`;
                    } else {
                        output += ' (Version: Not found)';
                    }
                }
                console.log(output);
            });
        }
    });
}

/**
 * Recursively scans a directory for HTML files and processes them.
 * @param {string} directoryPath - The path to the directory to scan.
 * @param {Object} argv - The yargs arguments.
 */
function scanDirectory(directoryPath, argv) {
    fs.readdir(directoryPath, { withFileTypes: true }, (err, entries) => {
        if (err) {
            console.error(`Error reading directory ${directoryPath}: ${err}`);
            return;
        }

        entries.forEach(entry => {
            const fullPath = path.join(directoryPath, entry.name);
            if (entry.isDirectory()) {
                scanDirectory(fullPath, argv);
            } else if (entry.isFile() && (entry.name.endsWith('.html') || entry.name.endsWith('.htm'))) {
                processFile(fullPath, argv);
            }
        });
    });
}

if (require.main === module) {
    const cliArgv = yargs(hideBin(process.argv))
        .option('file', {
            alias: 'f',
            description: 'Input HTML file to scan',
            type: 'string',
        })
        .option('directory', {
            alias: 'd',
            description: 'Input directory to scan recursively for HTML files',
            type: 'string',
        })
        .option('extract-version', {
            alias: 'v',
            description: 'Extracts version from CDN URLs if available',
            type: 'boolean',
            default: false,
        })
        .option('version-type', {
            description: 'Specify version type to extract (semantic or date)',
            type: 'string',
            choices: ['semantic', 'date'],
            default: 'semantic',
        })
        .check((argv) => {
            if (!argv.file && !argv.directory) {
                throw new Error('Error: Either --file or --directory must be provided.');
            }
            if (argv.file && argv.directory) {
                throw new Error('Error: Cannot provide both --file and --directory.');
            }
            return true;
        })
        .help()
        .alias('help', 'h')
        .argv;

    const loadedConfig = explorerSync.search();
    const config = loadedConfig ? loadedConfig.config : {};

    // Merge CLI arguments with config file settings, CLI arguments take precedence
    const argv = { ...config, ...cliArgv };

    if (argv.file) {
        processFile(argv.file, argv);
    } else if (argv.directory) {
        scanDirectory(argv.directory, argv);
    }
}

module.exports = { scanForCdnScripts, extractVersionFromUrl, processFile, scanDirectory };


