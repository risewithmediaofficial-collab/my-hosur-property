const property = {
  _id: "64a000000000000000000001",
  title: "Mahalaxhmi Layout – Premium residential plot near Bagalur Road, Hosur",
  propertyType: "Plot",
  listingType: "sale",
  price: 6072000,
  carpetArea: 1320,
  areaUnit: "sqft",
  possessionStatus: "Ready to Move",
  createdAt: "2026-10-08T09:00:00Z",
  location: { area: "Bagalur Road", city: "Hosur" },
  images: [],
  verification: { isVerified: true },
};

const listings = Array.from({ length: 6 }, (_, index) => ({
  ...property,
  _id: `64a00000000000000000000${index + 1}`,
}));

const checkPageWidth = () => {
  cy.document().should((doc) => {
    expect(doc.documentElement.scrollWidth).to.be.at.most(doc.documentElement.clientWidth);
  });
};

describe("Responsive property experience", () => {
  beforeEach(() => {
    // Keep layout checks independent of backend data and third-party scripts.
    cy.intercept("https://salesmax.ai/**", { statusCode: 204 });
    cy.intercept("https://maps.google.com/**", { statusCode: 204 });
    cy.intercept("GET", "**/api/**", { items: [], locations: [] });
    cy.intercept("GET", "**/api/properties?*", (req) => {
      const page = Number(new URL(req.url).searchParams.get("page") || 1);
      req.reply({ items: page === 1 ? listings : [{ ...property, _id: "64a000000000000000000099" }], page, totalPages: 2, total: 7 });
    }).as("listings");
    cy.intercept("GET", `**/api/properties/${property._id}`, { property, similar: [] }).as("property");
  });

  [320, 390].forEach((width) => {
    it(`uses document scrolling and visible categories at ${width}px`, () => {
      cy.viewport(width, 844);
      cy.visit("/properties");
      cy.wait("@listings");
      cy.get(".listing-results article").should("have.length", 6);
      cy.get(".listing-results-scroll").should("have.css", "overflow-y", "visible");
      cy.get(".listing-category").should("have.length", 8).each(($button) => {
        const rect = $button[0].getBoundingClientRect();
        expect(rect.left).to.be.at.least(0);
        expect(rect.right).to.be.at.most(width);
        expect(rect.height).to.be.at.least(44);
      });
      cy.get('[aria-label="Scroll controls"]').should("not.exist");
      checkPageWidth();
      cy.window().then((win) => expect(win.getComputedStyle(win.document.body).fontFamily).to.include("Inter"));
      cy.get('[aria-label="Open filters"]').click();
      cy.get('[role="dialog"][aria-label="Property filters"]').should("be.visible");
      cy.get('.property-filter-drawer-close').click();
      cy.get('[role="dialog"][aria-label="Property filters"]').should("not.exist");
      cy.get(".listing-results-scroll").should("have.css", "overflow-y", "visible");
      cy.scrollTo("bottom");
      cy.get(".listing-results article").should("have.length", 7);
      cy.window().its("scrollY").should("be.greaterThan", 0);
      cy.scrollTo("top");
      cy.screenshot(`properties-mobile-${width}`, { capture: "viewport" });
    });
  });

  it("keeps the full breadcrumb title and property actions aligned on mobile", () => {
    cy.viewport(390, 844);
    cy.visit(`/property/${property._id}`);
    cy.wait("@property");
    cy.get('.breadcrumbs [aria-current="page"]').should("have.text", property.title);
    cy.document().should((doc) => {
      const nav = doc.querySelector(".breadcrumbs");
      expect(nav.scrollWidth).to.be.at.most(nav.clientWidth);
      expect(nav.getBoundingClientRect().height).to.be.lessThan(160);
    });
    cy.get(".property-detail-actions button").should("have.length", 2);
    cy.document().then((doc) => {
      const buttons = doc.querySelectorAll(".property-detail-actions button");
      const first = buttons[0].getBoundingClientRect();
      const second = buttons[1].getBoundingClientRect();
      expect(first.top).to.equal(second.top);
      expect(first.width).to.be.closeTo(second.width, 1);
    });
    cy.get(".property-detail-title").should("have.css", "font-family").and("include", "Poppins");
    checkPageWidth();
    cy.screenshot("property-detail-mobile", { capture: "viewport" });
    cy.get('.breadcrumbs-back .breadcrumbs-link').click();
    cy.location("pathname").should("equal", "/listings");
    cy.window().its("scrollY").should("equal", 0);
  });

  [320, 390].forEach(width => {
    it(`keeps the mobile breadcrumb on one navigation row at ${width}px`, () => {
      cy.viewport(width, 844);
      const longProperty = { ...property, location: { area: "Bagalur Road near the northern residential extension", city: "Hosur" } };
      cy.intercept("GET", `**/api/properties/${property._id}`, { property: longProperty, similar: [] });
      cy.visit(`/property/${property._id}`);
      cy.get('.breadcrumbs-mobile-hidden').should("not.be.visible");
      cy.get('.breadcrumbs-current .breadcrumbs-separator').should("not.be.visible");
      cy.document().should(doc => {
        const back = doc.querySelector('.breadcrumbs-back .breadcrumbs-link').getBoundingClientRect();
        const parent = doc.querySelector('.breadcrumbs-parent .breadcrumbs-link').getBoundingClientRect();
        const current = doc.querySelector('.breadcrumbs-current .breadcrumbs-label').getBoundingClientRect();
        const nav = doc.querySelector('.breadcrumbs').getBoundingClientRect();
        expect(back.top).to.be.closeTo(parent.top, 1);
        expect(current.left).to.be.closeTo(nav.left, 1);
        expect(current.height).to.be.at.most(43);
        expect(nav.height).to.be.lessThan(100);
        expect(doc.documentElement.scrollWidth).to.be.at.most(doc.documentElement.clientWidth);
      });
      cy.screenshot(`property-breadcrumb-${width}`, { capture: "viewport" });
      cy.get('.breadcrumbs-parent .breadcrumbs-link').click();
      cy.location("pathname").should("equal", "/listings");
      cy.location("search").should("contain", "area=");
    });
  });

  it("preserves desktop results scrolling and adapts when resized to mobile", () => {
    cy.viewport(1440, 900);
    cy.visit("/properties");
    cy.wait("@listings");
    cy.get(".listing-results-scroll").should("have.css", "overflow-y", "auto");
    cy.get('[aria-label="Open filters sidebar"]').click();
    cy.get(".listing-filter-aside").should("be.visible");
    cy.get(".listing-filter-scroll").should("have.css", "overflow-y", "auto");
    cy.get(".listing-results-header").should("be.visible");
    cy.get(".listing-results article").first().should("be.visible");
    cy.get(".listing-results").should("have.css", "opacity", "1");
    checkPageWidth();
    cy.screenshot("properties-desktop", { capture: "viewport" });
    cy.viewport(390, 844);
    cy.get(".listing-results-scroll").should("have.css", "overflow-y", "visible");
    cy.get(".listing-filter-aside").should("not.be.visible");
    checkPageWidth();
  });

  it("uses aligned breadcrumbs and readable headings on the other public pages", () => {
    cy.viewport(390, 844);
    ["/about", "/services", "/contact", "/bank-loans", "/plans"].forEach((path) => {
      cy.visit(path);
      cy.get('.page-breadcrumb-bar .breadcrumbs-current').should("be.visible");
      cy.document().should((doc) => {
        expect(doc.querySelector('.page-breadcrumb-bar .breadcrumbs-current').textContent).not.to.match(/nav\./);
      });
      checkPageWidth();
    });
  });
});
