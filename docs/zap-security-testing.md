# OWASP ZAP Security Testing – OpenCart

## Overview

Performed security testing against a locally hosted OpenCart application using OWASP ZAP. The objective was to identify common web application security weaknesses, inspect HTTP request/response behavior, and manually investigate scanner findings rather than treating automated alerts as confirmed vulnerabilities.

## Test Environment

- Application: OpenCart
- Environment: Local Docker environment
- Target: `http://localhost:8080`
- Security Tool: OWASP ZAP
- Testing Approach: Passive scanning and manual validation
- Browser Traffic: Proxied through OWASP ZAP

## Testing Scope

Security testing included:

- HTTP security header analysis
- Cookie and session security review
- Cross-origin configuration review
- CSRF protection checks
- JavaScript dependency analysis
- Information disclosure analysis
- Potential XSS investigation
- Manual validation of selected scanner findings

## Findings Summary

OWASP ZAP identified 13 alert categories during passive analysis. Each category was reviewed individually, with scanner output treated as an indication for investigation rather than automatic confirmation of a vulnerability.

| Finding | ZAP Risk | Assessment |
|---|---|---|
| Vulnerable JS Library | High | Confirmed dependency finding |
| Absence of Anti-CSRF Tokens | Medium | Security configuration finding |
| Content Security Policy (CSP) Header Not Set | Medium | Confirmed missing header |
| Cross-Domain Misconfiguration | Medium | Configuration finding |
| Missing Anti-clickjacking Header | Medium | Confirmed missing header |
| Cookie No HttpOnly Flag | Medium | Cookie security finding |
| Server Leaks Information via `X-Powered-By` Header | Low | Confirmed information disclosure |
| Server Leaks Version Information via `Server` Header | Low | Confirmed information disclosure |
| X-Content-Type-Options Header Missing | Low | Confirmed missing header |
| Information Disclosure – Suspicious Comments | Informational | Reviewed; scanner-detected source comments |
| Modern Web Application | Informational | Informational only |
| Session Management Response Identified | Informational | Session token identification; not a vulnerability itself |
| User Controllable HTML Element Attribute (Potential XSS) | Informational | Manually investigated; XSS not confirmed |

## Manual Validation – Potential XSS

ZAP identified the `product_id` query parameter as potentially controlling an HTML element attribute.

Example application request:

`product_id=49`

A malformed value containing an encoded quotation mark was manually tested:

`product_id=49%22TEST`

Instead of demonstrating HTML or JavaScript injection, OpenCart returned a PHP `TypeError` indicating that `product_id` reached a backend method as a string where an integer was required.

### Result

**XSS was not confirmed by this manual test.**

However, the test exposed a separate information-disclosure/error-handling issue. The error response revealed internal implementation details including:

- PHP class and method name
- Parameter name and expected type
- Internal filesystem path
- Source filename
- Source code line number

Example disclosed path:

`/var/www/html/catalog/model/catalog/product.php`

This demonstrates the importance of manually validating automated scanner findings: the suspected XSS condition was not demonstrated, while testing revealed a different reproducible security weakness.

## Detailed Findings

### 1. Vulnerable JavaScript Library

**Detection:** OWASP ZAP identified JavaScript dependencies with known security concerns.

**Affected resources:**
- `moment.min.js`
- `moment-with-locales.min.js`

**Assessment:** Dependency-related security finding. Third-party libraries should be reviewed and upgraded to supported versions where applicable.

**Recommended remediation:**
- Identify the installed library version.
- Compare against a maintained release.
- Upgrade vulnerable/outdated dependencies.
- Re-run the security scan after upgrading.

---

### 2. Missing or Weak Security Headers

ZAP identified several HTTP response-header configuration issues:

- Content Security Policy (CSP) header not set
- Missing anti-clickjacking protection
- `X-Content-Type-Options` header missing
- Server version information exposed through the `Server` header
- PHP information exposed through the `X-Powered-By` header

**Assessment:** These findings indicate opportunities to harden the application's HTTP response configuration.

**Recommended remediation:**
- Define an appropriate Content Security Policy.
- Configure frame protection using CSP `frame-ancestors` or equivalent protection.
- Add `X-Content-Type-Options: nosniff`.
- Suppress unnecessary server/version information.
- Disable unnecessary PHP version disclosure.

---

### 3. Cookie and Session Security

ZAP identified:

- Cookie without the `HttpOnly` flag
- Session management response containing the `OCSESSID` session identifier

**Assessment:** Session-token detection itself is informational. Cookies containing sensitive session identifiers should use appropriate security attributes.

**Recommended remediation:**
- Apply `HttpOnly` to session cookies where application behavior permits.
- Apply `Secure` when the application is served over HTTPS.
- Maintain an appropriate `SameSite` policy.
- Avoid exposing session identifiers outside required cookie handling.

---

### 4. CSRF and Cross-Origin Configuration

ZAP reported:

- Absence of Anti-CSRF Tokens
- Cross-Domain Misconfiguration

**Assessment:** These scanner findings require endpoint/context-specific review because their security impact depends on how state-changing requests and cross-origin access are implemented.

**Recommended remediation:**
- Protect state-changing operations with appropriate CSRF controls.
- Restrict allowed origins, methods, headers, and credential use to application requirements.
- Avoid unnecessarily permissive cross-origin policies.

---

### 5. Information Disclosure

ZAP detected comments and server-response information that may reveal implementation details.

Manual malformed-input testing additionally produced a verbose PHP error containing internal application details.

**Assessment:** Unnecessary implementation information can assist application reconnaissance even when it does not directly provide an exploit.

**Recommended remediation:**
- Disable verbose production error output.
- Log detailed errors server-side rather than returning them to users.
- Remove unnecessary sensitive implementation comments.
- Suppress unnecessary framework, PHP, and web-server version information.

---

### 6. Potential XSS – Manual Investigation

ZAP reported user-controlled HTML attribute behavior involving the `product_id` parameter.

Manual testing with:

`product_id=49%22TEST`

did not demonstrate JavaScript execution or successful HTML injection. The malformed value instead caused a backend PHP type error.

**Assessment:** Potential XSS was investigated but not confirmed by the performed manual validation.

The test nevertheless uncovered the verbose-error information disclosure documented above.

---

### 7. Informational Findings

ZAP additionally identified the application as a modern web application and detected session-management behavior.

These alerts were reviewed as contextual/informational observations and were not treated as independently confirmed vulnerabilities.