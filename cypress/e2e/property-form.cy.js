describe("Property form location lookup", () => {
  it("searches remote locations only when the posting field is open", () => {
    const user = {
      _id: "64a000000000000000000010",
      name: "Test Seller",
      role: "seller",
      canPostProperty: true,
      email: "test@example.com",
      phone: "9999900000",
      address: "Hosur",
    };
    let searches = 0;
    cy.viewport(390, 844);
    cy.intercept("https://salesmax.ai/**", { statusCode: 204 });
    cy.intercept("GET", "**/api/**", { items: [], locations: [] });
    cy.intercept("GET", "**/api/auth/me", { user });
    cy.intercept("GET", "https://nominatim.openstreetmap.org/search?*", req => {
      searches += 1;
      req.reply([{ address: { suburb: "Latest Locality" } }]);
    }).as("locationSearch");
    cy.visit("/post-property", { onBeforeLoad(win) {
      win.localStorage.setItem("mhp_token", "test-session");
      win.localStorage.setItem("mhp_user", JSON.stringify(user));
    } });
    cy.contains("button h3", /^Plot$/).scrollIntoView().click();
    cy.get('input[name="geo-area-lookup"]').should("exist");
    cy.wait(500);
    cy.then(() => expect(searches).to.equal(0));
    cy.get('input[name="geo-area-lookup"]').scrollIntoView().type("Latest");
    cy.wait("@locationSearch");
    cy.contains("button", "Latest Locality").click();
    cy.get('input[name="geo-area-lookup"]').should("have.value", "Latest Locality");
    cy.then(() => expect(searches).to.equal(1));
  });
});
