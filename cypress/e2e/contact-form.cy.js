describe("Contact form stability", () => {
  beforeEach(() => {
    cy.intercept("https://salesmax.ai/**", { statusCode: 204 });
    cy.intercept("GET", "**/api/**", { items: [], locations: [] });
  });

  [1440, 390].forEach(width => {
    it(`keeps the page visible while editing every contact field at ${width}px`, () => {
      cy.viewport(width, 900);
      cy.visit("/contact");
      cy.get("#contact-name").scrollIntoView().focus();
      // Allow the initial reveal to finish before watching for typing-induced flashes.
      cy.wait(900);
      let stopWatching;
      let frames = 0;
      const flashes = [];
      cy.window().then(win => {
        if (width >= 768) {
          const resources = win.performance.getEntriesByType("resource").map(entry => entry.name).join("\n");
          expect(resources, "desktop scroll animations are enabled").to.match(/vendor-gsap|\/node_modules\/.*gsap/);
        }
        const targets = [
          ...win.document.querySelectorAll(".page-shell > .gsap-section"),
          win.document.querySelector("#contact-form").parentElement,
        ];
        const styles = () => targets.map(node => {
          const style = win.getComputedStyle(node);
          return { opacity: Number(style.opacity), transform: style.transform };
        });
        const baseline = styles();
        baseline.forEach(style => expect(style.opacity).to.equal(1));
        let frame;
        const watch = () => {
          frames += 1;
          styles().forEach((style, index) => {
            if (style.opacity < 0.99 || style.transform !== baseline[index].transform) flashes.push(style);
          });
          frame = win.requestAnimationFrame(watch);
        };
        frame = win.requestAnimationFrame(watch);
        stopWatching = () => win.cancelAnimationFrame(frame);
      });
      cy.get("#contact-name").type("Sathish Kumar", { delay: 40 }).should("have.value", "Sathish Kumar").should("have.focus");
      cy.get("#contact-email").type("sathish@example.com", { delay: 40 }).should("have.value", "sathish@example.com");
      cy.get("#contact-phone").type("9999900000", { delay: 40 }).should("have.value", "9999900000");
      cy.get("#contact-message").type("Looking for a property in Hosur.", { delay: 40 }).should("have.value", "Looking for a property in Hosur.");
      // Also capture any animation scheduled just after the final keystroke.
      cy.wait(700);
      cy.then(() => {
        stopWatching();
        expect(frames).to.be.greaterThan(10);
        expect(flashes, "page fades or moves while typing").to.deep.equal([]);
      });
      cy.get("#contact-name").should("have.value", "Sathish Kumar");
      cy.get("#contact-email").should("have.value", "sathish@example.com");
    });
  });
});
