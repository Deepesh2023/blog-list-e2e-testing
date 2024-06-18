const { test, expect, beforeEach, describe } = require('@playwright/test')
const testHelper = require('./test_helper')
const baseUrl = 'http://localhost:5173'

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post(`${baseUrl}/api/testing/reset`)

    await request.post(`${baseUrl}/api/users`, {
      data: {
        name: 'deepesh',
        username: 'deep_learning_42',
        password: 'deepesh',
      },
    })

    await page.goto(baseUrl)
  })

  test('Login form is shown', async ({ page }) => {
    const usernameInput = await page.locator('#username')
    const passwordInput = await page.locator('#password')

    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible()
    expect(usernameInput, passwordInput).toBeDefined()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await page.locator('#username').fill('deep_learning_42')
      await page.locator('#password').fill('deepesh')
      await page.getByRole('button', { name: 'Login' }).click()

      await expect(
        page.getByText('deep_learning_42 is logged in')
      ).toBeVisible()

      await expect(page.getByText('blogs')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await page.locator('#username').fill('deep_learning_42')
      await page.locator('#password').fill('wrong password')
      await page.getByRole('button', { name: 'Login' }).click()

      await expect(page.locator('.notification')).toHaveText(
        'incorrect password'
      )

      await expect(
        page.getByText('deep_learning_42 is logged in')
      ).not.toBeVisible()

      await expect(page.getByText('blogs')).not.toBeVisible()
    })

    test('a new blog can be created', async ({ page }) => {
      await testHelper.logUserIn(page, 'deep_learning_42', 'deepesh')

      await page.getByRole('button', { name: 'New Blog' }).click()
      await page.locator('#title').fill('a playwright blog test')
      await page.locator('#author').fill('myself')
      await page.locator('#url').fill('someurl.com')
      await page.getByRole('button', { name: 'Add blog' }).click()

      await expect(
        page.getByText('a playwright blog test, myself')
      ).toBeVisible()
    })
  })
})
