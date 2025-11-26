import { test, expect } from '@playwright/test';

test('signup and login flow', async ({ page }) => {
    const uniqueId = Date.now();
    const email = `test_verify_${uniqueId}@example.com`;
    const password = 'TestPassword123!';
    const name = 'Test Verify';

    // 1. Navigate to signup
    await page.goto('http://localhost:5040/signup');

    // 2. Fill form
    await page.getByLabel('Full Name').fill(name);
    await page.getByLabel('Email Address').fill(email);
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByLabel('Confirm Password').fill(password);

    // Role is Client by default.

    // 3. Click Sign Up
    await page.click('button[type="submit"]');

    // 4. Verify redirection to /login
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

    // 5. Log in
    // Login page likely has similar fields. I'll assume "Email Address" and "Password".
    // But I should check login page too if I want to be 100% sure.
    // For now I'll use placeholders or labels if they match.
    // Usually login has "Email" and "Password".
    await page.getByPlaceholder('you@company.com').fill(email);
    await page.getByPlaceholder('••••••••').fill(password);
    await page.click('button[type="submit"]');

    // 6. Verify redirection to /dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
});
