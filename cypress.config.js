import { defineConfig } from "cypress";

export default defineConfig({
  projectId: "sgxpv1",
  video: true,
  screenshotOnRunFailure: true,
  screenshotsFolder: "cypress/screenshots",
  videosFolder: "cypress/videos",
  viewportWidth: 1440,
  viewportHeight: 900,
  defaultCommandTimeout: 10000,
  pageLoadTimeout: 60000,
  requestTimeout: 15000,
  responseTimeout: 15000,
  retries: {
    runMode: 2,
    openMode: 0,
  },
  e2e: {
    baseUrl: "http://localhost:5173",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: false,
  },
});
