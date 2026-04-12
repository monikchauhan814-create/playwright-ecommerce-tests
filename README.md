# Playwright E-Commerce Automation Project

This project is an end-to-end test automation framework built using Playwright and JavaScript for an e-commerce web application.

It validates core user workflows such as authentication, user registration, product interaction, cart management, and checkout behavior.

---

## Tech Stack

- Playwright  
- JavaScript  
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
- Update cart quantity  
- Remove product from cart  

### Checkout
- Validate checkout flow error when payment method is not selected  

---

## Project Structure
tests/
login.spec.js
registration.spec.js
cart.spec.js
helpers/
auth.js
playwright.config.js
.github/workflows/playwright.yml

---

## Key Challenges & Solutions

- **Parallel Execution Issues**  
  Tests were interfering with each other due to shared state (cart data).  
  Resolved by controlling test execution and isolating test flows.

- **Shared Cart State Conflicts**  
  Multiple tests modifying the same cart caused flaky failures.  
  Fixed by ensuring each test manages its own state.

- **Locator Ambiguity**  
  Some elements had multiple matches (e.g., product links).  
  Resolved using more stable locators like `getByRole` and refined selectors.

---

## How to Run

Clone the repository:

---

## Key Challenges & Solutions

- **Parallel Execution Issues**  
  Tests were interfering with each other due to shared state (cart data).  
  Resolved by controlling test execution and isolating test flows.

- **Shared Cart State Conflicts**  
  Multiple tests modifying the same cart caused flaky failures.  
  Fixed by ensuring each test manages its own state.

- **Locator Ambiguity**  
  Some elements had multiple matches (e.g., product links).  
  Resolved using more stable locators like `getByRole` and refined selectors.

---

## How to Run

Clone the repository:
git clone https://github.com/monikchauhan814-create/playwright-ecommerce-tests.git
cd playwright-ecommerce-tests

Install dependencies:
npm install

Install browsers:
npx playwright install

Run tests:
npx playwright test

Open report:
npx playwright show-report

---

## CI/CD

This project uses GitHub Actions to automatically run Playwright tests on every push and pull request.

---

## Key Highlights

- End-to-end UI automation using Playwright  
- Covers real-world e-commerce workflows  
- Includes 10 automated test scenarios  
- Handles flaky test issues (parallel execution & shared state)  
- Uses reusable helper functions for cleaner test design  
- Integrated CI/CD pipeline for automated execution  

---

## Author

Monik Chauhan

