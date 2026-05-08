require("dotenv").config();
const connectDB = require("../config/db");
const Plan = require("../models/Plan");

const plans = [
  // --------------------------------------------------------
  // TIER 1: Customer, Seller
  // --------------------------------------------------------
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
    targetRole: ["customer", "seller"],
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
      "Priority AI matching",
      "Direct verified seller contact",
    ],
    listingLimit: 6,
    durationDays: 30,
    featuredBoost: true,
    category: "seller_listing",
    targetRole: ["customer", "seller"],
    contactUnlocks: 20,
    leadCredits: 10,
    boostDays: 10,
  },
  {
    name: "Elite",
    subtitle: "For Serious Investors",
    price: 2499,
    billingLabel: "/45 days",
    ctaLabel: "Go Elite",
    recommended: false,
    features: [
      "Everything in Premium",
      "Investment yield projections",
      "Dedicated property manager",
    ],
    listingLimit: 12,
    durationDays: 45,
    featuredBoost: true,
    category: "seller_listing",
    targetRole: ["customer", "seller"],
    contactUnlocks: 30,
    leadCredits: 20,
    boostDays: 20,
  },

  // --------------------------------------------------------
  // TIER 2: Agent, Broker
  // --------------------------------------------------------
  {
    name: "Pro Starter",
    subtitle: "For new agents",
    price: 4999,
    billingLabel: "/month",
    ctaLabel: "Get Started",
    recommended: false,
    features: [
      "Agent Dashboard",
      "Basic lead management",
      "Standard support",
    ],
    listingLimit: 6,
    durationDays: 30,
    featuredBoost: false,
    category: "broker_leads",
    targetRole: ["agent", "broker", "builder"],
    contactUnlocks: 20,
    leadCredits: 10,
    boostDays: 7,
  },
  {
    name: "Pro Plus",
    subtitle: "For growing agencies",
    price: 9999,
    billingLabel: "/60 days",
    ctaLabel: "Upgrade",
    recommended: true,
    features: [
      "Everything in Pro Starter",
      "Featured Listings",
      "Priority Support",
    ],
    listingLimit: 10,
    durationDays: 60,
    featuredBoost: true,
    category: "broker_leads",
    targetRole: ["agent", "broker", "builder"],
    contactUnlocks: 25,
    leadCredits: 20,
    boostDays: 14,
  },
  {
    name: "Pro Premium",
    subtitle: "For established brokers",
    price: 14999,
    billingLabel: "/90 days",
    ctaLabel: "Go Premium",
    recommended: false,
    features: [
      "Everything in Pro Plus",
      "Dedicated Account Manager",
      "Unlimited saves",
    ],
    listingLimit: 15,
    durationDays: 90,
    featuredBoost: true,
    category: "broker_leads",
    targetRole: ["agent", "broker", "builder"],
    contactUnlocks: 30,
    leadCredits: 25,
    boostDays: 30,
  },

  // TIER 3: Database Packages
  // --------------------------------------------------------
  {
    name: "DB Pack 1: Exclusive",
    subtitle: "Premium Contacts Database",
    price: 5000,
    billingLabel: "/8 contacts",
    ctaLabel: "Buy DB Pack",
    recommended: false,
    features: [
      "Access to 8 premium contacts",
      "Separate sellers and buyers details",
      "Verified contact information",
    ],
    listingLimit: 1, // dummy value, unused for DB access
    durationDays: 30,
    featuredBoost: false,
    category: "database_access",
    targetRole: ["all"],
    contactUnlocks: 8,
    leadCredits: 0,
    boostDays: 0,
  },
  {
    name: "DB Pack 2: Volume",
    subtitle: "Bulk Contacts Database",
    price: 1000,
    billingLabel: "/25 contacts",
    ctaLabel: "Buy DB Pack",
    recommended: true,
    features: [
      "Access to 25 contacts",
      "Separate sellers and buyers details",
      "Standard verified details",
    ],
    listingLimit: 1,
    durationDays: 30,
    featuredBoost: false,
    category: "database_access",
    targetRole: ["all"],
    contactUnlocks: 25,
    leadCredits: 0,
    boostDays: 0,
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
