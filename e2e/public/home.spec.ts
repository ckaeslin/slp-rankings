import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should display the homepage with main sections', async ({ page }) => {
    await page.goto('/')

    // Check for the main hero section
    await expect(page.locator('h1')).toBeVisible()

    // Check for navigation links
    await expect(page.locator('nav')).toBeVisible()
  })

  test('should navigate to rankings page', async ({ page }) => {
    await page.goto('/')

    // Click on rankings link (find by text or by specific selector)
    const rankingsLink = page.locator('a[href="/rankings"]').first()
    await rankingsLink.click()

    // Should navigate to rankings page
    await expect(page).toHaveURL('/rankings')
  })

  test('should navigate to tournaments page', async ({ page }) => {
    await page.goto('/')

    // Click on tournaments link
    const tournamentsLink = page.locator('a[href="/tournaments"]').first()
    await tournamentsLink.click()

    // Should navigate to tournaments page
    await expect(page).toHaveURL('/tournaments')
  })

  test('should navigate to clubs page', async ({ page }) => {
    await page.goto('/')

    // Click on clubs link
    const clubsLink = page.locator('a[href="/clubs"]').first()
    await clubsLink.click()

    // Should navigate to clubs page
    await expect(page).toHaveURL('/clubs')
  })
})
