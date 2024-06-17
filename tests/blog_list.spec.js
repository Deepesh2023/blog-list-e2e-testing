const { test, expect, beforeEach, describe } = require('@playwright/test')
const baseUrl = 'http://localhost:5173'

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

describe('Blog app', () => {
  test('Login form is shown', async ({ page }) => {
    const usernameInput = await page.locator('#username')
    const passwordInput = await page.locator('#password')

    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible()
    expect(usernameInput, passwordInput).toBeDefined()
  })
})
