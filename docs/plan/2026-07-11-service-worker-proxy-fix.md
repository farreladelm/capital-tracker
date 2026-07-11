# Service worker proxy fix

## Plan

- [x] Find why `/sw.js` redirects during service worker registration.
- [x] Exclude all file assets from the authentication proxy matcher.
- [x] Add unit coverage for static asset and app route matching.
- [x] Add browser E2E coverage for an unauthenticated service worker request.
- [x] Run focused unit check (4 tests pass).
- [x] Run focused lint check (no issues).
- [ ] Run build check (blocked: sandbox cannot fetch Google Manrope font).
- [ ] Ask user to run Playwright E2E checks.
