const logUserIn = async (page, username, password) => {
  await page.locator('#username').fill(username)
  await page.locator('#password').fill(password)
  await page.getByRole('button', { name: 'Login' }).click()
}

const createBlog = async (page, title, author, url) => {
  await page.getByRole('button', { name: 'New Blog' }).click()
  await page.locator('#title').fill(title)
  await page.locator('#author').fill(author)
  await page.locator('#url').fill(url)
  await page.getByRole('button', { name: 'Add blog' }).click()
  await page.getByText(title).waitFor()
}

module.exports = {
  logUserIn,
  createBlog,
}
