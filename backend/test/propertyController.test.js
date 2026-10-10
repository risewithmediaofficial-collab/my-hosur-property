const { test, after } = require("node:test");
const assert = require("node:assert/strict");
const User = require("../src/models/User");
const Property = require("../src/models/Property");
const cache = require("../src/config/cache");
const emailTemplates = require("../src/utils/emailTemplates");
const { createProperty } = require("../src/controllers/propertyController");

after(() => cache.close());

test("property publication errors reach Express error handling", async (t) => {
  const failure = new Error("Unable to prepare publication response");
  t.mock.method(User, "findById", async () => ({ role: "admin" }));
  t.mock.method(Property, "create", async () => ({ title: "Test property" }));
  t.mock.method(emailTemplates, "baseEmailLayout", () => { throw failure; });
  const next = t.mock.fn();

  await createProperty({ user: { _id: "owner", role: "admin" }, body: { images: [], documents: [] } }, {}, next);

  assert.equal(next.mock.calls.length, 1);
  assert.equal(next.mock.calls[0].arguments[0], failure);
});

test("accounts without posting access cannot create a property", async (t) => {
  t.mock.method(User, "findById", async () => ({ role: "buyer", canPostProperty: false }));
  const create = t.mock.method(Property, "create");
  const response = { status: t.mock.fn(() => response), json: t.mock.fn() };

  await createProperty({ user: { _id: "buyer" }, body: {} }, response, t.mock.fn());

  assert.equal(response.status.mock.calls[0].arguments[0], 403);
  assert.equal(create.mock.calls.length, 0);
});
