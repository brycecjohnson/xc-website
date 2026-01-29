# Skyview Cross Country Team Portal

A production static site built for a real high school cross country team, designed to demonstrate engineering practices: automated testing, CI/CD pipelines, accessibility compliance, performance budgets, and cloud infrastructure.

Built for my wife's team at Skyview Academy (Colorado) — used weekly by 50+ athlete families during the fall season.

**Live site**: [skyviewxc.com](https://d9mvm5wuesb39.cloudfront.net)

## What This Demonstrates

- **Test Engineering** — 118 Playwright E2E tests covering navigation, accessibility (WCAG 2.1 AA via axe-core), performance budgets, link validation, and responsive behavior
- **CI/CD** — 6-gate GitHub Actions pipeline: HTML validation → E2E tests → accessibility audit → performance budget → link validation → quality gate
- **Cloud Infrastructure** — AWS S3 + CloudFront with CloudWatch monitoring dashboard and alarms
- **Accessibility** — Automated WCAG 2.1 AA compliance checks on every PR
- **Performance** — Page weight budgets enforced in CI (CSS < 100KB, load time assertions)
- **Monitoring** — CloudWatch dashboard with error rate and latency alarms

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML, CSS (shared stylesheet with design tokens) |
| Testing | Playwright, axe-core |
| CI/CD | GitHub Actions (6-gate pipeline) |
| Hosting | AWS S3 (static site) |
| CDN/HTTPS | AWS CloudFront |
| Monitoring | AWS CloudWatch |
| Deployment | GitHub Pages (CI) + AWS S3 (production) |

## Testing

118 E2E tests across 5 spec files:

| Suite | What it covers |
|-------|---------------|
| `navigation.spec.ts` | Page loads, internal links, back navigation |
| `accessibility.spec.ts` | axe-core WCAG 2.1 AA scans on all pages |
| `performance.spec.ts` | Page load timing, resource budgets |
| `links.spec.ts` | Internal/external link validation |
| `responsive.spec.ts` | Mobile/desktop layouts, touch targets |

### Run Tests Locally

```bash
npm install
npx playwright install chromium --with-deps
npm test                    # Run all 118 tests
npm run test:headed         # Watch tests in browser
npm run test:ui             # Interactive Playwright UI
```

## CI/CD Pipeline

Every push and PR runs a 6-gate quality pipeline (`.github/workflows/ci.yml`):

```
validate → ┬─ e2e tests
            ├─ accessibility audit
            ├─ performance budget
            └─ link validation
                    ↓
              quality gate (all must pass)
```

Merges to `main` trigger deployment via `.github/workflows/deploy.yml`.

## Monitoring

`scripts/setup-monitoring.sh` provisions a CloudWatch dashboard tracking:
- CloudFront error rates (4xx/5xx)
- Request latency (p50, p95)
- Bandwidth and request volume
- Alarms for error rate spikes

## Project Structure

```
├── *.html                  # Site pages (index, training, results, etc.)
├── styles/main.css         # Shared stylesheet with CSS custom properties
├── scripts/
│   ├── deploy-s3.sh        # AWS S3 + CloudFront deployment
│   ├── setup-monitoring.sh # CloudWatch dashboard provisioning
│   └── theme-toggle.js     # Dark mode toggle
├── newsletters/            # Weekly newsletter HTML files
├── tests/e2e/              # Playwright test suites
├── .github/workflows/
│   ├── ci.yml              # 6-gate quality pipeline
│   └── deploy.yml          # GitHub Pages deployment
└── playwright.config.ts    # Test configuration
```

## Local Development

```bash
npm run serve               # Start local server on :8000
```

## Contact

**Bryce Johnson**
GitHub: [@brycecjohnson](https://github.com/brycecjohnson)
