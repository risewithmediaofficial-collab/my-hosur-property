import ta from "../../src/i18n/locales/ta.json";
import te from "../../src/i18n/locales/te.json";
import kn from "../../src/i18n/locales/kn.json";
import hi from "../../src/i18n/locales/hi.json";
import taCatalog from "../../src/i18n/catalog/ta.json";

const user = { _id: "64a000000000000000000010", name: "Test User", role: "customer" };
const resources = (win) => win.performance.getEntriesByType("resource").map(entry => entry.name).join("\n");
const languageChunk = (code) => new RegExp(`/(?:assets/${code}-|(?:locales|catalog)/${code}\\.json)`);
const pageChunk = (name) => new RegExp(`/${name}(?:-|\\.jsx)`);
const seedSession = (win, profile = user) => {
  win.localStorage.setItem("mhp_token", "test-session");
  win.localStorage.setItem("mhp_user", JSON.stringify(profile));
};

const setRange = (index, value) => {
  cy.get('input[type="range"]').eq(index).should("exist");
  cy.document().then(doc => {
    const input = doc.querySelectorAll('input[type="range"]')[index];
    const win = doc.defaultView;
    Object.getOwnPropertyDescriptor(win.HTMLInputElement.prototype, "value").set.call(input, value);
    input.dispatchEvent(new win.Event("input", { bubbles: true }));
    input.dispatchEvent(new win.Event("change", { bubbles: true }));
  });
};

describe("App loading and navigation", () => {
  beforeEach(() => {
    cy.viewport(390, 844);
    cy.intercept("https://salesmax.ai/**", { statusCode: 204 });
    cy.intercept("https://verify.msg91.com/**", { statusCode: 204 });
    cy.intercept("https://verify.phone91.com/**", { statusCode: 204 });
    cy.intercept("GET", "**/api/**", { items: [], locations: [], totalPages: 1, page: 1 });
  });

  it("keeps unrelated pages, languages and scroll animations out of mobile startup", () => {
    cy.visit("/");
    cy.get("h1").should("be.visible");
    // Covers the previous idle preloading interval.
    cy.wait(1800);
    cy.window().then(win => {
      const loaded = resources(win);
      ["ta", "te", "kn", "hi"].forEach(code => expect(loaded).not.to.match(languageChunk(code)));
      expect(loaded).not.to.match(/vendor-gsap|\/node_modules\/.*gsap/);
      ["AuthPage", "AdminDashboardPage", "ContactPage"].forEach(name => expect(loaded).not.to.match(pageChunk(name)));
    });
  });

  it("loads each selected language and keeps catalog translations after refresh", () => {
    cy.visit("/services");
    cy.get("h1").should("be.visible");
    [["ta", ta], ["te", te], ["kn", kn], ["hi", hi]].forEach(([code, translations]) => {
      cy.get('.footer-language select').scrollIntoView().select(code);
      cy.document().its("documentElement.lang").should("equal", code);
      cy.contains("h1", translations.servicesPage.heroTitlePrefix).should("exist");
      cy.window().then(win => {
        expect(win.localStorage.getItem("myhosurproperty_lang")).to.equal(code);
        expect(resources(win)).to.match(languageChunk(code));
      });
    });
    cy.get('.footer-language select').scrollIntoView().select("ta");
    cy.document().its("documentElement.lang").should("equal", "ta");
    cy.contains("h3", taCatalog["Loan Services"]).should("exist");
    cy.reload();
    cy.contains("h1", ta.servicesPage.heroTitlePrefix).should("be.visible");
    cy.document().its("documentElement.lang").should("equal", "ta");
    cy.window().then(win => {
      expect(resources(win)).to.match(languageChunk("ta"));
      ["te", "kn", "hi"].forEach(code => expect(resources(win)).not.to.match(languageChunk(code)));
    });
  });

  it("keeps the latest language selection when an earlier download is slower", () => {
    cy.intercept("GET", languageChunk("ta"), req => req.continue(res => res.setDelay(700)));
    cy.visit("/services");
    cy.get('.footer-language select').scrollIntoView().select("ta");
    cy.get('.footer-language select').select("hi");
    cy.document().its("documentElement.lang").should("equal", "hi");
    cy.wait(900);
    cy.document().its("documentElement.lang").should("equal", "hi");
    cy.contains("h1", hi.servicesPage.heroTitlePrefix).should("exist");
  });

  it("recovers from a malformed saved session", () => {
    cy.visit("/properties", { onBeforeLoad(win) {
      win.localStorage.setItem("mhp_token", "invalid-session");
      win.localStorage.setItem("mhp_user", "{broken-json");
    } });
    cy.get(".listing-results-header").should("be.visible");
    cy.get('button[aria-label="Logout"]').should("not.exist");
  });

  [["customer", "CustomerDashboardPage"], ["agent", "AgentDashboardPage"], ["buyer", "UserDashboardPage"]].forEach(([role, dashboard]) => {
    it(`loads only the ${role} dashboard and preserves tabs through refresh and browser navigation`, () => {
      const profile = { ...user, role };
      cy.viewport(1440, 900);
      cy.intercept("GET", "**/api/auth/me", { user: profile });
      cy.visit("/dashboard?tab=saved", { onBeforeLoad: win => seedSession(win, profile) });
      cy.contains("h2", "Saved Properties").should("be.visible");
      cy.window().then(win => {
        const loaded = resources(win);
        expect(loaded).to.match(pageChunk(dashboard));
        ["CustomerDashboardPage", "AgentDashboardPage", "UserDashboardPage", "AdminDashboardPage"].filter(name => name !== dashboard)
          .forEach(name => expect(loaded).not.to.match(pageChunk(name)));
      });
      cy.get("aside nav button").first().click();
      cy.location("search").should("equal", "");
      cy.reload();
      cy.get("aside nav button").first().should("be.visible");
      cy.window().then(win => {
        win.history.pushState({}, "", "/dashboard?tab=saved");
        win.dispatchEvent(new win.PopStateEvent("popstate"));
      });
      cy.contains("h2", "Saved Properties").should("be.visible");
      cy.go("back");
      cy.location("search").should("equal", "");
      cy.contains("h2", "Saved Properties").should("not.exist");
    });
  });

  it("does not restore a signed-out session when its profile request finishes", () => {
    cy.viewport(1440, 900);
    cy.intercept("GET", "**/api/auth/me", { user, delay: 1500 });
    cy.visit("/properties", { onBeforeLoad: seedSession });
    cy.get('button[aria-label="Logout"]').click();
    cy.location("pathname").should("equal", "/");
    cy.wait(1800);
    cy.get('button[aria-label="Logout"]').should("not.exist");
    cy.window().then(win => {
      expect(win.localStorage.getItem("mhp_token")).to.equal(null);
      expect(win.localStorage.getItem("mhp_user")).to.equal(null);
    });
  });

  it("keeps the latest filter results when an older request finishes later", () => {
    const property = { _id: "64a000000000000000000001", propertyType: "Plot", listingType: "sale", price: 1000000, location: { area: "Latest Area", city: "Hosur" }, images: [] };
    cy.intercept("GET", "**/api/properties?*", req => {
      const latest = new URL(req.url).searchParams.get("search") === "Latest Area";
      req.reply({ delay: latest ? 0 : 1400, body: { items: [{ ...property, title: latest ? "Latest property result" : "Outdated property result" }], totalPages: 1, page: 1, total: 1 } });
    });
    cy.visit("/properties");
    cy.get('.listing-results-header form input').type("Latest Area{enter}");
    cy.contains(".listing-results article", "Latest property result").should("be.visible");
    cy.wait(1600);
    cy.contains(".listing-results article", "Latest property result").should("exist");
    cy.contains(".listing-results article", "Outdated property result").should("not.exist");
  });

  it("updates the bank rate without resetting the loan amount", () => {
    cy.visit("/bank-loans");
    setRange(0, "40");
    cy.get('input[type="range"]').first().should("have.value", "40");
    setRange(1, "8.2");
    cy.contains("section button", /^PNB$/).first().click();
    cy.get('input[type="range"]').first().should("have.value", "40");
    cy.get('input[type="range"]').eq(1).should("have.value", "7.55");
  });

  it("updates listing filters when navigating to a different query on the same page", () => {
    const property = { _id: "64a000000000000000000001", listingType: "sale", price: 1000000, location: { city: "Hosur" }, images: [] };
    cy.intercept("GET", "**/api/properties?*", req => {
      const villa = new URL(req.url).searchParams.get("category") === "villa";
      req.reply({ items: [{ ...property, propertyType: villa ? "Villa" : "Plot", title: villa ? "Villa navigation result" : "Plot navigation result" }], totalPages: 1, page: 1, total: 1 });
    });
    cy.visit("/properties?category=plot");
    cy.contains(".listing-results article", "Plot navigation result").should("be.visible");
    cy.window().then(win => {
      win.history.pushState({}, "", "/properties?category=villa");
      win.dispatchEvent(new win.PopStateEvent("popstate"));
    });
    cy.contains(".listing-results article", "Villa navigation result").should("be.visible");
    cy.contains(".listing-results article", "Plot navigation result").should("not.exist");
    cy.go("back");
    cy.contains(".listing-results article", "Plot navigation result").should("be.visible");
    cy.get('[aria-label="Open filters"]').click();
    cy.get('[role="dialog"][aria-label="Property filters"]').should("be.visible");
    cy.get('.property-filter-drawer-close').click();
  });

  it("shows final statistics immediately on mobile and with reduced motion", () => {
    cy.visit("/about");
    cy.contains("span", /^100\+$/).should("exist");
    cy.contains("span", /^8\+$/).should("exist");
    cy.viewport(1440, 900);
    cy.visit("/about", { onBeforeLoad(win) {
      const matchMedia = win.matchMedia.bind(win);
      win.matchMedia = query => {
        const media = matchMedia(query);
        if (query.includes("prefers-reduced-motion")) Object.defineProperty(media, "matches", { value: true });
        return media;
      };
    } });
    cy.contains("span", /^100\+$/).should("exist");
    cy.contains("span", /^8\+$/).should("exist");
  });

});
