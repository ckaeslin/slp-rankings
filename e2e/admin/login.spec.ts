import { test, expect } from '@playwright/test'

test.describe('Admin Login', () => {
  test('should display the login page', async ({ page }) => {
    await page.goto('/login')

    // Check for login form elements
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login')

    // Fill in invalid credentials
    await page.fill('input[type="email"]', 'invalid@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')

    // Submit the form
    await page.click('button[type="submit"]')

    // Should show error message (waiting for the error to appear)
    await expect(page.locator('text=/invalid|error|falsch/i')).toBeVisible({ timeout: 5000 })
  })

  test('should redirect to login when accessing admin without auth', async ({ page }) => {
    // Try to access admin page without authentication
    await page.goto('/admin')

    // Should redirect to login page
    await expect(page).toHaveURL(/\/login/)
  })

  test('should redirect to login when accessing admin members without auth', async ({ page }) => {
    // Try to access admin members page without authentication
    await page.goto('/admin/members')

    // Should redirect to login page
    await expect(page).toHaveURL(/\/login/)
  })
})
