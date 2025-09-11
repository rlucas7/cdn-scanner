# Security Note: CodeQL Flagged Risk in prettify/lang-css.js

The file `doc/scripts/prettify/lang-css.js` is part of the third-party Prettify syntax highlighter library. CodeQL scanning has flagged this file for several CWEs (CWE-20, CWE-80, CWE-116, CWE-184, CWE-185, CWE-186) due to the use of regular expressions for parsing HTML and comments, which can be unsafe.

**Risk Handling:**
- This file is not maintained by this project and is only used for syntax highlighting documentation/code samples.
- No user-generated content is processed by this library in production.
- The risk is documented here and will not be addressed unless a secure update is released by the library maintainers or the library is replaced.

**Suppressing CodeQL Alerts:**
To ignore this issue in future CodeQL scans, add the following to your `.github/codeql/codeql-config.yml` (or `.codeql/config.yml`):

```yaml
exclude:
  - path: doc/scripts/prettify/lang-css.js
```

Alternatively, you can use CodeQL suppression comments if supported for JavaScript:

```javascript
// codeql[ignore]: CWE-20, CWE-80, CWE-116, CWE-184, CWE-185, CWE-186
```

Refer to the [CodeQL documentation](https://docs.github.com/en/code-security/code-scanning/using-codeql-code-scanning/customizing-codeql-code-scanning) for more details on suppressing or excluding alerts.
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
