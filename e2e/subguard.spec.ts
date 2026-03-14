import { test, expect, Page } from "@playwright/test"
import dotenv from "dotenv"
import path from "path"
dotenv.config({ path: path.resolve(__dirname, "../.env.local") })

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "https://subguard-hackathon-ailoitte.vercel.app"
const ADMIN    = { email: process.env.TEST_ADMIN_EMAIL!,    password: process.env.TEST_ADMIN_PASSWORD! }
const EMPLOYEE = { email: process.env.TEST_EMPLOYEE_EMAIL!, password: process.env.TEST_EMPLOYEE_PASSWORD! }

async function login(page: Page, email: string, password: string) {
  await page.goto(`${BASE_URL}/login`)
  await page.locator('[data-test="login-email"]').fill(email)
  await page.locator('[data-test="login-password"]').fill(password)
  await page.locator('[data-test="login-submit"]').click()
}

test("Flow 1 — Admin logs in and sees total monthly spend", async ({ page }) => {
  await login(page, ADMIN.email, ADMIN.password)
  await expect(page).toHaveURL(/\/admin/, { timeout: 10000 })
  const spendEl = page.locator('[data-test="total-spend"]')
  await expect(spendEl).toBeVisible({ timeout: 10000 })
  const spendText = await spendEl.locator('.stat-val').innerText()
  const spend = parseFloat(spendText.replace(/[^\d.,]/g, "").replace(/,/g, "")) || 0
  expect(spend).toBeGreaterThanOrEqual(0)
})

test("Flow 2 — Employee logs in and submits a $50/mo request", async ({ page }) => {
  await login(page, EMPLOYEE.email, EMPLOYEE.password)
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
  await page.locator('[data-test="request-software-btn"]').click()
  const modal = page.locator('[data-test="request-modal"]')
  await expect(modal).toBeVisible()
  await page.locator('[data-test="request-tool-name"]').fill("E2E Test Tool")
  await page.locator('[data-test="request-monthly-cost"]').fill("50")
  await page.locator('[data-test="request-justification"]').fill("Automated E2E test submission.")
  await page.locator('[data-test="request-submit-btn"]').click()
  await expect(modal).not.toBeVisible({ timeout: 15000 })
})

test("Flow 3 — Admin approves request and spend increases by $50", async ({ page }) => {
  await login(page, ADMIN.email, ADMIN.password)
  await expect(page).toHaveURL(/\/admin/, { timeout: 10000 })
  const spendEl = page.locator('[data-test="total-spend"]')
  await expect(spendEl).toBeVisible({ timeout: 10000 })
  const beforeText = await spendEl.locator('.stat-val').innerText()
  const before = parseFloat(beforeText.replace(/[^\d.,]/g, "").replace(/,/g, "")) || 0
  await page.waitForTimeout(2000)
  const pendingRow = page.locator('[data-test="pending-request-row"]').filter({ hasText: "E2E Test Tool" })
  await expect(pendingRow).toBeVisible({ timeout: 15000 })
  await pendingRow.locator('[data-test="approve-btn"]').click()
  await expect(pendingRow).not.toBeVisible({ timeout: 10000 })
  await page.waitForTimeout(1500)
  const afterText = await spendEl.locator('.stat-val').innerText()
  const after = parseFloat(afterText.replace(/[^\d.,]/g, "").replace(/,/g, "")) || 0
  expect(after - before).toBeCloseTo(50, 0)
})