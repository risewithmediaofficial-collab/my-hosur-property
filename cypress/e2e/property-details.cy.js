const property = {
  _id: "64a000000000000000000001",
  title: "Premium residential plot",
  propertyType: "Plot",
  listingType: "sale",
  price: 6072000,
  landArea: "1320",
  builtupArea: 1320,
  areaUnit: "sqft",
  facing: "East",
  possessionStatus: "Ready to Move",
  location: { area: "Bagalur Road", village: "Mahalaxhmi Layout", city: "Hosur", taluk: "Hosur", district: "Krishnagiri", state: "Tamil Nadu", country: "India" },
  amenities: ["Gated Community", "Park", "CCTV Camera", "Security"],
  images: [],
  description: [
    "Property Type: Plot", "Property Category: General",
    "Location: Bagalur Road, Mahalaxhmi Layout, Hosur, Krishnagiri, Tamil Nadu",
    "Land Area: 1320", "Length: 30", "Width: 44", "Facing: West",
    "Road Width: 25", "Road Type: Mud Road", "Soil Type: Red Soil",
    "RERA Approved: No", "HNTDA Approved: No",
    "Facilities: Gated Community, Park, CCTV Camera, Security",
    "🏡 Premium Residential Plots", "📍 Prime Location", "📐 Well-Planned Layout",
    "🛣️ Excellent Road Connectivity", "🏫 Schools & Colleges Nearby",
    "🏥 Hospitals Nearby", "🛒 Shopping & Daily Essentials Nearby",
    "🚌 Easy Access to Public Transport", "💰 Great Investment Opportunity",
    "🌿 Peaceful & Family-Friendly Environment", "🌟 Ideal for Building Your Dream Home",
    "📞 Contact Us for More Details",
  ].join("\n"),
};

describe("Compact property details", () => {
  beforeEach(() => {
    cy.intercept("https://salesmax.ai/**", { statusCode: 204 });
    cy.intercept("https://maps.google.com/**", { statusCode: 204 });
    cy.intercept("GET", "**/api/**", { items: [], locations: [] });
    cy.intercept("GET", `**/api/properties/${property._id}`, { property, similar: [] });
  });

  [320, 390, 1440].forEach(width => {
    it(`turns legacy summaries into aligned cards at ${width}px`, () => {
      cy.viewport(width, 900);
      cy.visit(`/property/${property._id}`);
      cy.get(".property-details-panel").scrollIntoView();
      cy.get('[data-detail="landArea"] dd').should("have.text", "1,320 sq.ft");
      cy.get('[data-detail="builtupArea"]').should("not.exist");
      cy.get('[data-detail="length"] dd').should("have.text", "30");
      cy.get('[data-detail="width"] dd').should("have.text", "44");
      cy.get('[data-detail="facing"] dd').should("have.text", "East");
      cy.get('[data-detail="rera"] dd').should("have.text", "No");
      cy.get(".property-details-amenities li").should("have.length", 4);
      cy.get(".property-details-highlights li").should("have.length", 12);
      cy.contains(".property-details-panel", "Property Type: Plot").should("not.exist");
      cy.contains(".property-details-highlights", "Shopping & Daily Essentials Nearby").should("exist");
      cy.get(".property-details-address").should("have.text", "Bagalur Road, Mahalaxhmi Layout, Hosur, Krishnagiri, Tamil Nadu, India");
      cy.document().should(doc => {
        const cards = [...doc.querySelectorAll(".property-detail-fact")].map(card => card.getBoundingClientRect());
        expect(cards[0].top).to.equal(cards[1].top);
        expect(cards[0].width).to.be.closeTo(cards[1].width, 1);
        cards.forEach(card => {
          expect(card.left).to.be.at.least(0);
          expect(card.right).to.be.at.most(width);
        });
        expect(doc.documentElement.scrollWidth).to.be.at.most(doc.documentElement.clientWidth);
      });
      cy.screenshot(`property-details-${width}`, { capture: "viewport" });
    });
  });

  it("keeps freeform descriptions, unknown labels and rental details readable", () => {
    const description = "A bright apartment with a spacious living room and excellent natural light. The owner welcomes site visits by appointment and can share further documentation on request.";
    const rental = { ...property, propertyType: "Apartment", listingType: "rent", landArea: "", builtupArea: 1200, bhk: 2, bathrooms: 2, monthlyRent: 18000, furnishingStatus: "Semi-Furnished", description: `Monthly Rent: 18000\nFacilities: Lift, Security\n${description}\nVisit time: Weekends only` };
    cy.intercept("GET", `**/api/properties/${property._id}`, { property: rental, similar: [] });
    cy.viewport(320, 900);
    cy.visit(`/property/${property._id}`);
    cy.get('[data-detail="bedrooms"] dd').should("have.text", "2 BHK");
    cy.get('[data-detail="monthlyRent"] dd').should("have.text", "₹18,000");
    cy.contains(".property-details-highlights li", description).should("exist");
    cy.contains(".property-details-highlights li", "Visit time: Weekends only").should("exist");
    cy.contains(".property-details-amenities li", "Lift").should("exist");
    cy.document().should(doc => expect(doc.documentElement.scrollWidth).to.be.at.most(doc.documentElement.clientWidth));
  });
});
