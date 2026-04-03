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
