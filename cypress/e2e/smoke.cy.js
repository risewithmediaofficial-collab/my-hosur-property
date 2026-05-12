describe("MyHosurProperty smoke test", () => {
  it("loads the home page", () => {
    cy.visit("/");
    cy.contains("MyHosurProperty").should("be.visible");
    cy.contains("Properties").should("be.visible");
  });

  it("loads the auth page", () => {
    cy.visit("/auth");
    cy.contains(/sign in|create account/i).should("be.visible");
  });
});
