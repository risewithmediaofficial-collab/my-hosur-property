import { CONTACT_ADDRESS, CONTACT_EMAIL, CONTACT_PHONE_NUMBERS, SOCIAL_LINKS } from "../../src/constants/contactInfo";

const checkWidth = () => cy.document().should(doc => {
  expect(doc.documentElement.scrollWidth).to.be.at.most(doc.documentElement.clientWidth);
});

describe("Compact shared footer", () => {
  beforeEach(() => {
    cy.intercept("https://salesmax.ai/**", { statusCode: 204 });
    cy.intercept("GET", "**/api/**", { items: [], locations: [] });
  });

  [320, 390, 768, 1440].forEach(width => {
    it(`keeps a compact footer with every link available at ${width}px`, () => {
      cy.viewport(width, 900);
      cy.visit("/about");
      cy.get(".page-shell").should("exist");
      cy.get(".site-footer").scrollIntoView().should("be.visible");
      cy.get(".footer-socials a").should("have.length", 6);
      cy.get('.footer-socials a[aria-label="WhatsApp"]').should("have.attr", "href", SOCIAL_LINKS.whatsapp);
      cy.get(".footer-language select option").should("have.length", 5);
      cy.document().should(doc => {
        const quick = doc.querySelector(".footer-quick-links summary");
        const contact = doc.querySelector(".footer-contact summary");
        const top = node => node.getBoundingClientRect().top;
        expect(top(quick.querySelector("span"))).to.equal(top(contact.querySelector("span")));
        expect(top(quick.querySelector("svg"))).to.equal(top(contact.querySelector("svg")));
        const style = node => doc.defaultView.getComputedStyle(node);
        expect(style(quick).fontSize).to.equal(style(contact).fontSize);
        expect(style(quick.querySelector("svg")).width).to.equal(style(contact.querySelector("svg")).width);
        if (width < 768) {
          const socials = [...doc.querySelectorAll(".footer-socials a")];
          socials.forEach(link => expect(top(link)).to.equal(top(socials[0])));
          const links = [...doc.querySelectorAll(".footer-bottom nav a")];
          expect(top(links[0])).to.equal(top(links[1]));
          expect(top(links[2])).to.equal(top(links[3]));
        }
      });
      cy.get(".footer-language select").focus();
      cy.document().should(doc => {
        const style = doc.defaultView.getComputedStyle(doc.querySelector(".footer-language select"));
        expect(style.color).to.equal("rgb(255, 255, 255)");
        expect(style.backgroundColor).to.equal("rgb(24, 71, 120)");
        expect(style.backgroundImage).to.contain("e5edf7");
        if (width < 768) expect(parseFloat(style.fontSize)).to.be.at.least(16);
      });
      cy.get(".footer-language select").blur();
      cy.get('.site-footer').screenshot(`footer-${width}`);
      cy.document().should(doc => {
        const footer = doc.querySelector(".site-footer");
        const sizes = [...footer.querySelectorAll('.footer-container > *, .footer-main > *')].map(node => `${node.className}:${node.getBoundingClientRect().height}`);
        expect(footer.getBoundingClientRect().height, sizes.join(", ")).to.be.lessThan(width < 768 ? 600 : 550);
      });
      if (width < 768) {
        cy.get(".footer-quick-links").should("not.have.attr", "open");
        cy.get(".footer-contact").should("not.have.attr", "open");
        cy.get(".footer-quick-links summary").click();
        cy.get(".footer-contact summary").click();
      }
      cy.get(".footer-link-grid a").should("have.length", 10).each(link => cy.wrap(link).should("be.visible"));
      cy.get(".footer-email").should("have.attr", "href", `mailto:${CONTACT_EMAIL}`);
      cy.get(".footer-phones a").should("have.length", 4);
      CONTACT_PHONE_NUMBERS.forEach(phone => cy.get(`.footer-phones a[href="tel:${phone.tel}"]`).should("be.visible"));
      cy.get(".footer-contact address").should("have.text", CONTACT_ADDRESS);
      cy.get(".footer-locations summary").click();
      cy.get(".footer-location-grid a").should("have.length", 19).each(link => cy.wrap(link).should("be.visible"));
      checkWidth();
      cy.contains(".footer-location-grid a", "Bagalur Road Property").click();
      cy.location("pathname").should("equal", "/location/bagalur-road-property");
      cy.window().its("scrollY").should("equal", 0);
    });
  });

  it("keeps the footer compact across pages and supports language changes and resizing", () => {
    cy.viewport(390, 900);
    ["/", "/services", "/contact", "/bank-loans", "/plans"].forEach(route => {
      cy.visit(route);
      cy.get("h1").should("be.visible");
      cy.get(".site-footer").scrollIntoView().should("be.visible");
      checkWidth();
    });
    cy.get('.footer-language select').select("ta");
    cy.document().its("documentElement.lang").should("equal", "ta");
    checkWidth();
    cy.viewport(1440, 900);
    cy.get(".footer-quick-links").should("have.attr", "open");
    cy.get(".footer-contact").should("have.attr", "open");
    checkWidth();
    cy.viewport(320, 900);
    cy.get(".footer-quick-links").should("not.have.attr", "open");
    cy.get(".footer-contact").should("not.have.attr", "open");
    checkWidth();
  });
});
