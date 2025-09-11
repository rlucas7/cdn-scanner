# CDN Script Scanner

A CLI tool to scan an input HTML file for all occurrences of `<script>` tags that inject JavaScript from CDNs.

## Installation

```bash
npm install
```

## Usage

To scan a single HTML file:

```bash
node index.js --file <path_to_html_file>
```

Example:

```bash
node index.js --file examples/script_cdn_example.html
```

To scan an entire directory for HTML files:

```bash
node index.js --directory <path_to_directory>
```

Example:

```bash
node index.js --directory examples/
```

### Extracting Version Information

To extract version numbers from CDN URLs, use the `--extract-version` or `-v` flag:

```bash
node index.js --file <path_to_html_file> --extract-version
# or
node index.js --file <path_to_html_file> -v
```

## Running Tests

To run the test suite and view code coverage:

```bash
npm test
```

## Viewing API Documentation

To view the generated API documentation, open the `out/index.html` file in your web browser:

```bash
# On macOS
open out/index.html

# On Linux
x-www-browser out/index.html

# On Windows
start out/index.html
```
