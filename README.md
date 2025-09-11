# CDN Script Scanner

A CLI tool to scan an input HTML file for all occurrences of `<script>` tags that inject JavaScript from CDNs.

## Installation

```bash
npm install
```

## Usage

To scan a single HTML file:

```bash
cdn-scanner --file <path_to_html_file>
```

Example:

```bash
cdn-scanner --file examples/script_cdn_example.html
```

To scan an entire directory for HTML files:

```bash
cdn-scanner --directory <path_to_directory>
```

Example:

```bash
cdn-scanner --directory examples/
```

### Extracting Version Information

To extract version numbers from CDN URLs, use the `--extract-version` or `-v` flag:

```bash
cdn-scanner --file <path_to_html_file> --extract-version
# or
cdn-scanner --file <path_to_html_file> -v
```

### Configuration File

For more persistent configuration, you can create a `cdn-scanner.config.js` file in your project's root directory. This file can export an object with default settings. CLI flags will always take precedence over configuration file settings.

Example `cdn-scanner.config.js`:

```javascript
module.exports = {
  extractVersion: true,
  versionType: 'semantic',
};
```

Available options in the configuration file:
- `extractVersion`: (boolean) Set to `true` to enable version extraction by default.
- `versionType`: (string) Specify the default version type to extract ('semantic' or 'date').

## Running Tests

To run the test suite and view code coverage:

```bash
npm test
```

## Viewing API Documentation

To view the generated API documentation, open the `doc/index.html` file in your web browser:

```bash
# On macOS
open doc/index.html

# On Linux
x-www-browser doc/index.html

# On Windows
start doc/index.html
```
