# CDN Script Scanner

A CLI tool to scan an input HTML file for all occurrences of `<script>` tags that inject JavaScript from CDNs.

## Installation

```bash
npm install
```

## Usage

To scan an HTML file:

```bash
node index.js --file <path_to_html_file>
```

Example:

```bash
node index.js --file examples/script_cdn_example.html
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
