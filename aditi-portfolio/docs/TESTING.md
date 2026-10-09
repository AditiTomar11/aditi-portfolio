# Verification notes

Verified on **9 October 2026** with Node.js 20.20.2 and headless Chromium.

| Area                                                 | Result                                                                                           |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Included API and validation tests                    | 13 passed                                                                                        |
| Production frontend build                            | Passed                                                                                           |
| npm dependency audit                                 | 0 known vulnerabilities at verification time                                                     |
| Real MongoDB persistence                             | Passed using an isolated temporary MongoDB 7.0.24                                                |
| Project filters, technology search and details       | Passed                                                                                           |
| Three.js canvas, orbit, keyboard, reset and remix    | Passed                                                                                           |
| Contact form storage, server validation and honeypot | Passed                                                                                           |
| JWT login, expired/missing auth guards               | Auth guards and login passed; two-hour expiration configured                                     |
| Project creation, editing, deletion and unique slugs | Passed                                                                                           |
| Newly created Design category on public frontend     | Passed                                                                                           |
| Inbox read state and message deletion                | Passed                                                                                           |
| Responsive widths                                    | 360, 393, 768, 1024 and 1440px; no horizontal overflow                                           |
| Mobile menu and persistent motion setting            | Passed                                                                                           |
| Browser JavaScript errors                            | None during end-to-end checks                                                                    |
| Automated main-page WCAG 2 A/AA scan                 | 0 findings at 1440px using axe-core; not a substitute for a complete manual accessibility review |

No connection to Aditi's own database was made. The temporary database and test inquiries were removed after the checks.

SMTP notifications require your own provider credentials and were not tested against a live email provider. Third-party project links were preserved from the supplied seed; their uptime is outside this application's control. Deployment configurations are included but no public deployment was made.

Run the included checks yourself:

```bash
npm ci
npm run check
npm audit
```
