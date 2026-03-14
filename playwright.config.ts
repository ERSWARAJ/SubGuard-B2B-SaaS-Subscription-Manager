import { defineConfig, devices } from "@playwright/test"
import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: 1,
  timeout: 30000,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL: "https://subguard-hackathon-ailoitte.vercel.app",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
})
