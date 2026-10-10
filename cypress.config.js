import { defineConfig } from "cypress";

export default defineConfig({
  allowCypressEnv: false,
  video: false,
  requestTimeout: 20000,
  e2e: {
    baseUrl: "http://127.0.0.1:5173",
    supportFile: false,
    specPattern: "cypress/e2e/**/*.cy.js",
  },
});
