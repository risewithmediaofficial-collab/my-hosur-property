require("dotenv").config();
const connectDB = require("../config/db");
const Plan = require("../models/Plan");

const plans = [
  {
    name: "Starter",
    subtitle: "For Casual Searchers",
    price: 499,
    billingLabel: "/month",
    ctaLabel: "Get Started",
    recommended: false,
    features: [
      "AI property recommendations",
      "Save up to 5 properties",
      "Basic market insights",
      "Standard support",
    ],
    listingLimit: 3,
    durationDays: 30,
    featuredBoost: false,
    category: "seller_listing",
    targetRole: "all",
    contactUnlocks: 10,
    leadCredits: 5,
    boostDays: 3,
  },
  {
    name: "Premium",
    subtitle: "Most Popular Choice",
    price: 999,
    billingLabel: "/month",
    ctaLabel: "Go Premium",
    recommended: true,
    features: [
      "Everything in Starter",
      "Unlimited property saves",
      "Priority AI matching",
      "Neighborhood crime & safety data",
      "Early access to new listings",
      "Direct verified seller contact",
    ],
    listingLimit: 12,
    durationDays: 30,
    featuredBoost: true,
    category: "seller_listing",
    targetRole: "all",
    contactUnlocks: 40,
    leadCredits: 20,
    boostDays: 10,
  },
  {
    name: "Elite",
    subtitle: "For Serious Investors",
    price: 2499,
    billingLabel: "/month",
    ctaLabel: "Contact Sales",
    recommended: false,
    features: [
      "Everything in Premium",
      "Investment yield projections",
      "Dedicated property manager",
      "Unlimited virtual tours",
      "Verified legal documents",
      "24/7 VIP concierge support",
    ],
    listingLimit: 30,
    durationDays: 60,
    featuredBoost: true,
    category: "seller_listing",
    targetRole: "all",
    contactUnlocks: 100,
    leadCredits: 60,
    boostDays: 20,
  },
];

const seed = async () => {
  await connectDB();
  await Plan.deleteMany({});
  await Plan.insertMany(plans);
  console.log("Plans seeded");
  process.exit(0);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
