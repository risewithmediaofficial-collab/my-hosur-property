export const currency = (value = 0) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

export const slugify = (text = "") =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

export const formatArea = (value, unit = "sqft") => {
  if (!value && value !== 0) return "";
  const suffix = unit === "sqm" ? "sq.m" : "sq.ft";
  return `${Number(value).toLocaleString("en-IN")} ${suffix}`;
};
