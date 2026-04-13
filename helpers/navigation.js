export async function goToLogin(page) {
  await page.goto('');
  await page.getByRole('link', { name: 'My Account' }).first().click();
  await page.getByRole('link', { name: 'Login' }).click();
}