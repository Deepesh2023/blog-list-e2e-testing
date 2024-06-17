const { test, expect, beforeEach, describe } = require('@playwright/test')
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

  test('Login form is shown by default', async ({ page }) => {
    await expect(page.getByText('Username')).toBeVisible()
    await expect(page.getByText('Password')).toBeVisible()
    await expect(page.getByText('Blogs')).not.toBeVisible()
  })

  describe('login into application', () => {
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

      const notificationDiv = await page.locator('.notification')
      await expect(notificationDiv).toContainText('incorrect password')
    })
  })

  describe('when logged in', () => {
    beforeEach(async ({ page }) => {
      await page.getByTestId('username').fill('deep_learning_42')
      await page.getByTestId('password').fill('deepesh')
      await page.getByRole('button', { name: 'login' }).click()
    })

    test('can create a blog', async ({ page }) => {
      await page.getByRole('button', { name: 'New Blog' }).click()

      await page.locator('#title').fill('new blog test')
      await page.locator('#author').fill('deepesh')
      await page.locator('#url').fill('someurl.com')

      await page.getByRole('button', { name: 'Add blog' }).click()

      const blogDiv = await page.locator('.blog')
      const notificationDiv = await page.locator('.notification')

      await expect(notificationDiv).toContainText('Blog added!')
      await expect(blogDiv).toContainText('new blog test')
    })
  })
})
