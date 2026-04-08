# Playwright E-Commerce Tests

This is a small end-to-end automation project for an e-commerce website using Playwright and JavaScript.  
The goal was to cover basic user flows and practice building a clean and simple automation structure.

## What this project covers

The tests focus on common user actions like:

- Login  
- Searching for products  
- Adding items to cart  
- Checking cart  
- Basic checkout flow  

## Tech used

- Playwright  
- JavaScript  
- Node.js  

## Project structure

tests/ → test files for different flows  
pages/ → page object files (reusable methods)  
utils/ → test data or helper functions  
playwright.config.js  

## How to run

Clone the repo:

git clone https://github.com/monikchauhan814-create/playwright-ecommerce-tests.git  
cd playwright-ecommerce-tests  

Install dependencies:

npm install  

Install browsers:

npx playwright install  

Run tests:

npx playwright test  

Run in headed mode:

npx playwright test --headed  

Open report:

npx playwright show-report  

## Notes

- Used Page Object Model to keep tests organized  
- Tried to use stable locators (like getByRole where possible)  
- Focused on writing simple and readable tests  

## Why I built this

I wanted hands-on practice with Playwright and to understand how real test automation projects are structured.

## Author

Monik Chauhan
