const { test, expect, beforeEach, describe } = require('@playwright/test')
const testHelper = require('./test_helper')
const exp = require('constants')
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

    await request.post(`${baseUrl}/api/users`, {
      data: {
        name: 'binil',
        username: 'binil_balu',
        password: 'binil',
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
  })

  describe('When logged in', () => {
    test('a new blog can be created', async ({ page }) => {
      await testHelper.logUserIn(page, 'deep_learning_42', 'deepesh')

      await page.getByRole('button', { name: 'New Blog' }).click()
      await page.locator('#title').fill('a playwright blog test')
      await page.locator('#author').fill('myself')
      await page.locator('#url').fill('someurl.com')
      await page.getByRole('button', { name: 'Add blog' }).click()

      const blogDiv = await page.locator('.blog')

      await expect(blogDiv).toContainText('a playwright blog test, myself')
    })

    test('can like a blog', async ({ page }) => {
      await testHelper.logUserIn(page, 'deep_learning_42', 'deepesh')
      await testHelper.createBlog(page)
      await page.getByRole('button', { name: 'View' }).click()
      await page.getByRole('button', { name: 'Like' }).click()

      await expect(page.getByText('Likes: 1')).toBeVisible()
    })

    test('can delete a blog', async ({ page }) => {
      await testHelper.logUserIn(page, 'deep_learning_42', 'deepesh')
      await testHelper.createBlog(page)
      await page.on('dialog', (dialog) => dialog.accept())
      await page.getByRole('button', { name: 'Delete' }).click()

      await expect(
        page.getByText('another helper blog, myself')
      ).not.toBeVisible()
    })

    test('only the user added the blog can see the delete button', async ({
      page,
    }) => {
      await testHelper.logUserIn(page, 'deep_learning_42', 'deepesh')
      await testHelper.createBlog(page)

      const blogDiv = await page.locator('.blog')
      await expect(blogDiv).toContainText('another helper blog, myself')

      await page.getByRole('button', { name: 'Logout' }).click()

      await testHelper.logUserIn(page, 'binil_balu', 'binil')

      await expect(blogDiv).toContainText('another helper blog, myself')
      await expect(
        page.getByRole('button', { name: 'Delete' })
      ).not.toBeVisible()
    })
  })
})
