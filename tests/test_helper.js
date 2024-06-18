const logUserIn = async (page, username, password) => {
  await page.locator('#username').fill(username)
  await page.locator('#password').fill(password)
  await page.getByRole('button', { name: 'Login' }).click()
}

const createBlog = async (page) => {
  await page.getByRole('button', { name: 'New Blog' }).click()
  await page.locator('#title').fill('another helper blog')
  await page.locator('#author').fill('myself')
  await page.locator('#url').fill('someanotherurl.com')
  await page.getByRole('button', { name: 'Add blog' }).click()
}

module.exports = {
  logUserIn,
  createBlog,
}
