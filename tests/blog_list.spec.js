const { test, expect, beforeEach, describe } = require('@playwright/test')
const testHelper = require('./test_helper')
const exp = require('constants')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post(`/api/testing/reset`)

    await request.post(`/api/users`, {
      data: {
        name: 'deepesh',
        username: 'deep_learning_42',
        password: 'deepesh',
      },
    })

    await request.post(`/api/users`, {
      data: {
        name: 'binil',
        username: 'binil_balu',
        password: 'binil',
      },
    })

    await page.goto('/')
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

      await expect(page.getByRole('heading', { name: 'blogs' })).toBeVisible()
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
    beforeEach(async ({ page }) => {
      await testHelper.logUserIn(page, 'deep_learning_42', 'deepesh')
    })

    test('a new blog can be created', async ({ page }) => {
      await page.getByRole('button', { name: 'New Blog' }).click()
      await page.locator('#title').fill('a playwright blog test')
      await page.locator('#author').fill('myself')
      await page.locator('#url').fill('someurl.com')
      await page.getByRole('button', { name: 'Add blog' }).click()

      const blogDiv = await page.locator('.blog')

      await expect(blogDiv).toContainText('a playwright blog test, myself')
    })

    test('can like a blog', async ({ page }) => {
      await testHelper.createBlog(
        page,
        'another helper blog',
        'myself',
        'someurl.com'
      )
      await page.getByRole('button', { name: 'View' }).click()
      await page.getByRole('button', { name: 'Like' }).click()

      await expect(page.getByText('Likes: 1')).toBeVisible()
    })

    test('can delete a blog', async ({ page }) => {
      await testHelper.createBlog(
        page,
        'another helper blog',
        'myself',
        'someurl.com'
      )
      await page.on('dialog', (dialog) => dialog.accept())
      await page.getByRole('button', { name: 'Delete' }).click()

      await expect(
        page.getByText('another helper blog, myself')
      ).not.toBeVisible()
    })

    test('only the user added the blog can see the delete button', async ({
      page,
    }) => {
      await testHelper.createBlog(
        page,
        'another helper blog',
        'myself',
        'someurl.com'
      )

      const blogDiv = await page.locator('.blog')
      await expect(blogDiv).toContainText('another helper blog, myself')

      await page.getByRole('button', { name: 'Logout' }).click()

      await testHelper.logUserIn(page, 'binil_balu', 'binil')

      await expect(blogDiv).toContainText('another helper blog, myself')
      await expect(
        page.getByRole('button', { name: 'Delete' })
      ).not.toBeVisible()
    })

    test('blogs are arrenged in decending order based on likes', async ({
      page,
    }) => {
      let likeButton = null
      let blog = null

      await testHelper.createBlog(
        page,
        'test blog with 0 likes',
        'myself',
        'tesurl.moc'
      )

      await testHelper.createBlog(
        page,
        'test blog with 5 likes',
        'myself',
        'tesurl.moc'
      )

      await testHelper.createBlog(
        page,
        'test blog with 10 likes',
        'myself',
        'tesurl.moc'
      )

      // gives he first blog 0 likes

      // giving the second blog 5 likes
      blog = await page
        .locator('.blog')
        .filter({ hasText: 'test blog with 5 likes' })

      await blog.getByRole('button', { name: 'View' }).click()
      likeButton = await blog.getByRole('button', { name: 'Like' })

      for (let i = 0; i < 5; i++) {
        await likeButton.click()
      }

      await expect(blog.getByText('Likes: 5')).toBeVisible()
      await blog.locator('.hideButton').click()

      // giving the third blog 10 likes
      blog = await page
        .locator('.blog')
        .filter({ hasText: 'test blog with 10 likes' })

      await blog.getByRole('button', { name: 'View' }).click()
      likeButton = await blog.getByRole('button', { name: 'Like' })

      for (let i = 0; i < 10; i++) {
        await likeButton.click()
      }

      await expect(blog.getByText('Likes: 10')).toBeVisible()
      await blog.locator('.hideButton').click()

      await page.reload()
      await expect(page.locator('.blog')).toHaveCount(3)

      // getting the blogs list after page refresh
      let blogs = await page.locator('.blog').all()

      await blogs[0].getByText('View').click()
      await expect(blogs[0]).toContainText('Likes: 10')

      await blogs[1].getByText('View').click()
      await expect(blogs[1]).toContainText('Likes: 5')

      await blogs[2].getByText('View').click()
      await expect(blogs[2]).toContainText('Likes: 0')
    })
  })
})
