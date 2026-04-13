# Playwright E-Commerce Automation Project

## Overview
End-to-end test automation project built using Playwright for an OpenCart demo e-commerce application.

This project validates core user workflows including authentication, registration, cart operations, and checkout behavior.

---

## Tech Stack
- Playwright (JavaScript)
- Node.js
- GitHub Actions (CI/CD)

---

## Test Coverage
Total Automated Tests: **10**

### Authentication
- Successful login  
- Invalid login  

### Registration
- Successful registration  
- Registration with existing email  
- Password mismatch validation  

### Cart & Product Flow
- Add product to cart  
- Verify product appears in cart  
- Update product quantity  
- Remove product from cart  

### Checkout
- Validate checkout error when payment method is not selected  

---

## Project Structure

tests/
  login.spec.js
  registration.spec.js
  cart.spec.js

helpers/
  navigation.js
  cart.js
  auth.js

playwright.config.js
.github/workflows/playwright.yml


---

## Key Challenges & Solutions

### Parallel Execution Issues
Tests were interfering due to shared cart state.  
**Solution:** Disabled parallel execution and ensured test isolation.

### Shared Cart State Conflicts
Multiple tests modified the same cart causing flaky failures.  
**Solution:** Each test creates and manages its own state.

### Locator Ambiguity
Elements like product links had multiple matches.  
**Solution:** Replaced XPath with Playwright locators (`getByRole`, scoped locators).

---

## How to Run

```bash
git clone https://github.com/monikchauhan814-create/playwright-ecommerce-tests.git
cd playwright-ecommerce-tests

npm install
npx playwright install
npx playwright test

View report:
npx playwright show-report

```

## CI/CD

GitHub Actions runs Playwright tests automatically on every push and pull request.

## Key Highlights

- End-to-end UI automation using Playwright
- Covers real-world e-commerce workflows
- Includes 10 automated test scenarios
- Handles flaky test issues (shared state and parallel execution)
- Uses reusable helper functions for clean test design
- Integrated CI/CD pipeline

## Notes

Checkout is partially automated due to limitations in selecting a payment method on the demo site.

## Author

Monik Chauhan
