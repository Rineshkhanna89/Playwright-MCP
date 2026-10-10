import 'dotenv/config';
import { test, expect, type Page } from '@playwright/test';

declare const process: {
  env: Record<string, string | undefined>;
};

const LOGIN_URL = 'https://leaftaps.com/opentaps/control/main';
const LOGOUT_URL = 'https://leaftaps.com/opentaps/control/logout';
function getValidCredentials() {
  const username = process.env.LEAFTAPS_USERNAME;
  const password = process.env.LEAFTAPS_PASSWORD;

  if (!username || !password) {
    throw new Error('Set LEAFTAPS_USERNAME and LEAFTAPS_PASSWORD in the environment or .env file.');
  }

  return { username, password };
}

async function openLoginPage(page: Page) {
  await page.goto(LOGIN_URL, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Leaftaps Login' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Username' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
}

async function login(page: Page, username: string, password: string) {
  await page.getByRole('textbox', { name: 'Username' }).fill(username);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
}

test.describe('Leaftaps Login Functionality', () => {
  test.describe.configure({ mode: 'serial' });

  test('1. Valid login with approved credentials', async ({ page }) => {
    await openLoginPage(page);
    const { username, password } = getValidCredentials();

    await test.step('Enter valid credentials and submit login', async () => {
      await login(page, username, password);
    });

    await expect(page.getByRole('heading', { name: 'Welcome Demo Sales Manager' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'CRM/SFA' })).toBeVisible();
  });

  test('2. Invalid username shows error', async ({ page }) => {
    await openLoginPage(page);

    await test.step('Submit invalid username', async () => {
      await login(page, 'invaliduser', 'not-a-valid-password');
    });

    await expect(page.getByText(/following error occurred during login: User not found\./i)).toBeVisible();
    await expect(page).toHaveURL(/\/opentaps\/control\/login/i);
  });

  test('4. Invalid username and password show error', async ({ page }) => {
    await openLoginPage(page);

    await test.step('Submit invalid credentials', async () => {
      await login(page, 'invaliduser', 'badpass');
    });

    await expect(page.getByText(/following error occurred during login: User not found\./i)).toBeVisible();
  });

  test('5. Empty username and password fields show validation errors', async ({ page }) => {
    await openLoginPage(page);

    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText(/username was empty reenter/i)).toBeVisible();
    await expect(page.getByText(/password was empty reenter/i)).toBeVisible();
  });

  test('6. Blank username only shows validation error', async ({ page }) => {
    await openLoginPage(page);
    const { password } = getValidCredentials();

    await page.getByRole('textbox', { name: 'Password' }).fill(password);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText(/username was empty reenter/i)).toBeVisible();
  });

  test('7. Blank password only shows validation error', async ({ page }) => {
    await openLoginPage(page);
    const { username } = getValidCredentials();

    await page.getByRole('textbox', { name: 'Username' }).fill(username);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText(/password was empty reenter/i)).toBeVisible();
  });

  test('8. Password field is masked', async ({ page }) => {
    await openLoginPage(page);

    const passwordField = page.getByRole('textbox', { name: 'Password' });
    await passwordField.fill('mask-check');

    await expect(passwordField).toHaveAttribute('type', 'password');
  });

  test('9. Successful navigation after valid login', async ({ page }) => {
    await openLoginPage(page);
    const { username, password } = getValidCredentials();
    await login(page, username, password);

    await expect(page.getByRole('link', { name: 'CRM/SFA' })).toBeVisible();
    await page.getByRole('link', { name: 'CRM/SFA' }).click();
    await expect(page).toHaveURL(/\/crmsfa\/control\/main/i);
  });

  test('10. Logout from authenticated session', async ({ page }) => {
    await openLoginPage(page);
    const { username, password } = getValidCredentials();
    await login(page, username, password);

    await page.getByRole('button', { name: 'Logout' }).click();

    await expect(page.getByRole('heading', { name: 'Leaftaps Login' })).toBeVisible();
  });

  test('11. Logged out user is redirected to login form', async ({ page }) => {
    await page.goto(LOGOUT_URL, { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'Leaftaps Login' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Username' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
  });

  test('12. Login page loads with required form elements before authentication', async ({ page }) => {
    await openLoginPage(page);

    await expect(page.getByRole('heading', { name: 'Leaftaps Login' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Username' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });

  test('3. Invalid password shows error', async ({ page }) => {
    await openLoginPage(page);
    const { username } = getValidCredentials();

    await test.step('Submit invalid password', async () => {
      await login(page, username, 'wrongpass');
    });

    await expect(page.getByText(/following error occurred during login: Password incorrect\./i)).toBeVisible();
  });
});
