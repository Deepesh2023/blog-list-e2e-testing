const { test, expect, beforeEach, describe } = require('@playwright/test')
const baseUrl = 'http://localhost:5173'

describe('Blog app', () => {
  beforeEach(async ({ page }) => {
    await page.goto(baseUrl)
  })

  test('Login form is shown by default', async ({ page }) => {
    await expect(page.getByText('username')).toBeVisible()
    await expect(page.getByText('password')).toBeVisible()
    await expect(page.getByText('Blogs')).not.toBeVisible()
  })

  describe('login into application', () => {
    beforeEach(async ({ page, request }) => {
      await request.post(`${baseUrl}/api/testing/reset`)
      await request.post(`${baseUrl}/api/users`, {
        data: {
          name: 'deepesh',
          username: 'deep_learning_42',
          password: 'deepesh',
        },
      })
    })

    test('can do a successful login', async ({ page }) => {
      await page.getByTestId('username').fill('deep_learning_42')
      await page.getByTestId('password').fill('deepesh')
      await page.getByRole('button', { name: 'login' }).click()

      await expect(page.getByText('Blogs')).toBeVisible()
    })

    test('handle and unsuccessful login', async ({ page }) => {
      await page.getByTestId('username').fill('deep_learning_42')
      await page.getByTestId('password').fill('wrong password')
      await page.getByRole('button', { name: 'login' }).click()

      const errorDiv = await page.locator('.error')
      await expect(errorDiv).toContainText('incorrect password')
    })
  })
})
