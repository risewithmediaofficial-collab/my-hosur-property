const { test } = require("node:test");
const { once } = require("node:events");
const assert = require("node:assert/strict");
const axios = require("axios");
const app = require("../src/app");
const salesDaddyService = require("../src/services/salesDaddyService");
const { submitContactForm } = require("../src/controllers/contactController");

test("normalizeMobile formats Indian and international numbers cleanly", () => {
  assert.equal(salesDaddyService.normalizeMobile("9876543210"), "9876543210");
  assert.equal(salesDaddyService.normalizeMobile("09876543210"), "9876543210");
  assert.equal(salesDaddyService.normalizeMobile("91 98765-43210"), "+919876543210");
  assert.equal(salesDaddyService.normalizeMobile("+91 98765 43210"), "+919876543210");
  assert.equal(salesDaddyService.normalizeMobile("+1 (415) 555-0199"), "+14155550199");
});

test("createSalesDaddyLead throws 503 when SALESDADDY_API_KEY is unset", async () => {
  const prevKey = process.env.SALESDADDY_API_KEY;
  delete process.env.SALESDADDY_API_KEY;

  try {
    await assert.rejects(
      () =>
        salesDaddyService.createSalesDaddyLead({
          name: "Test User",
          email: "test@example.com",
          phone: "9876543210",
          message: "Looking for plots",
        }),
      (err) => err.statusCode === 503 && err.code === "SALESDADDY_NOT_CONFIGURED"
    );
  } finally {
    if (prevKey !== undefined) {
      process.env.SALESDADDY_API_KEY = prevKey;
    }
  }
});

test("createSalesDaddyLead posts strictly formatted payload with Bearer auth", async (t) => {
  const prevKey = process.env.SALESDADDY_API_KEY;
  process.env.SALESDADDY_API_KEY = "sd_live_test_token";

  const postMock = t.mock.method(axios, "post", async () => ({
    data: { ok: true, leadId: "lead-123", duplicate: false },
  }));

  try {
    const result = await salesDaddyService.createSalesDaddyLead({
      name: "Karthik Raja",
      email: "KARTHIK@example.com",
      phone: "09876543210",
      message: "Need DTCP plot details in Hosur",
    });

    assert.equal(result.leadId, "lead-123");
    assert.equal(postMock.mock.calls.length, 1);

    const [url, payload, config] = postMock.mock.calls[0].arguments;
    assert.equal(url, "https://api.salesdaddy.in/v1/ext/leads");
    assert.equal(config.headers.Authorization, "Bearer sd_live_test_token");
    assert.deepEqual(payload, {
      name: "Karthik Raja",
      mobile: "9876543210",
      email: "karthik@example.com",
      source: "website",
      voiceConsent: "opted_in",
      note: "Need DTCP plot details in Hosur",
      tags: ["Contact Page"],
      custom: { page: "/contact" },
    });
  } finally {
    if (prevKey === undefined) delete process.env.SALESDADDY_API_KEY;
    else process.env.SALESDADDY_API_KEY = prevKey;
  }
});

test("submitContactForm returns 201 and forwards payload via /api/contact route", async (t) => {
  const prevKey = process.env.SALESDADDY_API_KEY;
  const prevSmtp = process.env.SMTP_HOST;
  process.env.SALESDADDY_API_KEY = "sd_live_test_token";
  delete process.env.SMTP_HOST;

  const postMock = t.mock.method(axios, "post", async () => ({
    data: { ok: true, leadId: "lead-route-1", duplicate: true },
  }));

  const server = app.listen(0, "127.0.0.1");
  try {
    await once(server, "listening");
    const { port } = server.address();
    const res = await fetch(`http://127.0.0.1:${port}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Anitha",
        email: "anitha@example.com",
        phone: "9876543210",
        message: "Interested in villas near Bagalur Road",
      }),
    });

    const json = await res.json();
    assert.equal(res.status, 201);
    assert.equal(json.ok, true);
    assert.equal(json.leadId, "lead-route-1");
    assert.equal(json.duplicate, true);
    assert.equal(postMock.mock.calls.length, 1);

    // Invalid phone number rejected at validation middleware before calling Sales Daddy
    const invalidRes = await fetch(`http://127.0.0.1:${port}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Anitha",
        email: "anitha@example.com",
        phone: "123",
      }),
    });
    assert.equal(invalidRes.status, 422);
    assert.equal(postMock.mock.calls.length, 1);
  } finally {
    server.close();
    if (prevKey === undefined) delete process.env.SALESDADDY_API_KEY;
    else process.env.SALESDADDY_API_KEY = prevKey;
    if (prevSmtp !== undefined) process.env.SMTP_HOST = prevSmtp;
  }
});

test("submitContactForm returns upstream error status cleanly if Sales Daddy rejects", async (t) => {
  const prevKey = process.env.SALESDADDY_API_KEY;
  process.env.SALESDADDY_API_KEY = "sd_live_test_token";

  t.mock.method(axios, "post", async () => {
    const err = new Error("Unprocessable");
    err.response = { status: 422, data: { ok: false, error: "invalid_number", message: "Invalid mobile" } };
    throw err;
  });

  const res = {
    statusCode: 0,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };

  try {
    await submitContactForm(
      {
        body: {
          name: "Test",
          email: "test@example.com",
          phone: "9876543210",
          message: "Hello",
        },
      },
      res
    );

    assert.equal(res.statusCode, 422);
    assert.equal(res.body.ok, false);
    assert.match(res.body.message, /valid 10-digit mobile number/i);
  } finally {
    if (prevKey === undefined) delete process.env.SALESDADDY_API_KEY;
    else process.env.SALESDADDY_API_KEY = prevKey;
  }
});

test("createSalesDaddyLead maps invalid_mobile to friendly message for both HTTP 422 and HTTP 200 ok:false", async (t) => {
  const prevKey = process.env.SALESDADDY_API_KEY;
  process.env.SALESDADDY_API_KEY = "sd_live_test_token";

  try {
    t.mock.method(axios, "post", async () => {
      const err = new Error("Unprocessable");
      err.response = {
        status: 422,
        data: { ok: false, error: "invalid_mobile", message: "invalid_mobile" },
      };
      throw err;
    });

    await assert.rejects(
      () =>
        salesDaddyService.createSalesDaddyLead({
          name: "Test User",
          email: "test@example.com",
          phone: "9876543210",
        }),
      (err) =>
        err.statusCode === 422 &&
        err.code === "invalid_mobile" &&
        err.message === "Please enter a valid 10-digit mobile number."
    );

    t.mock.restoreAll();

    t.mock.method(axios, "post", async () => ({
      data: { ok: false, error: "invalid_mobile", message: "invalid_mobile" },
    }));

    await assert.rejects(
      () =>
        salesDaddyService.createSalesDaddyLead({
          name: "Test User",
          email: "test@example.com",
          phone: "9876543210",
        }),
      (err) =>
        err.statusCode === 422 &&
        err.code === "invalid_mobile" &&
        err.message === "Please enter a valid 10-digit mobile number."
    );
  } finally {
    if (prevKey === undefined) delete process.env.SALESDADDY_API_KEY;
    else process.env.SALESDADDY_API_KEY = prevKey;
  }
});
