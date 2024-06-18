const logUserIn = async (page, username, password) => {
  await page.locator('#username').fill('deep_learning_42')
  await page.locator('#password').fill('deepesh')
  await page.getByRole('button', { name: 'Login' }).click()
}

module.exports = {
  logUserIn,
}
