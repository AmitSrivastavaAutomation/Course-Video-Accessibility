# Course Video Accessibility — Playwright Automation

## Project Structure

```
├── config/
│   └── config.js          # URLs & credentials
├── tests/
│   └── aicerts.spec.js    # AI Certs Learner Platform (TC-101 to TC-109)
├── utils/
│   └── helpers.js         # Shared utilities
├── screenshots/           # Auto-created on run
├── reports/               # HTML + JSON reports
├── playwright.config.js
└── package.json
```

## Setup

```bash
npm install
npx playwright install chromium
```

## Run Tests

```bash
# Run all tests
npm test

# Run only AI Certs tests
npm run test:aicerts

# View HTML report
npm run report
```

## Test Cases

### AI Certs Learner Platform (aicerts.spec.js)

| ID     | Description                                    |
|--------|------------------------------------------------|
| TC-101 | Application launches successfully              |
| TC-102 | Login page renders correctly                   |
| TC-103 | Valid login — assert success immediately       |
| TC-104 | Invalid credentials show error                 |
| TC-105 | Enrolled course visible after login            |
| TC-106 | Open enrolled course                           |
| TC-107 | Navigate to video section                      |
| TC-108 | All videos accessible (loop + screenshots)     |
| TC-109 | Logout redirects to login page                 |

> **Note:** Netcom Learning (`netcomlearning.com`) is covered by a manual QA plan,
> sample test cases, and bug reporting only — no automation required per assignment.