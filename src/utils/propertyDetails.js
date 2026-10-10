import { currency } from "./format";

const DETAIL_FIELDS = [
  ["propertyType", "Property Type"],
  ["propertyClass", "Property Category"],
  ["landArea", "Land Area"],
  ["flatArea", "Flat Area"],
  ["cents", "Cents"],
  ["builtupArea", "Built-up Area"],
  ["monthlyRent", "Monthly Rent"],
  ["advance", "Advance"],
  ["pgType", "PG Type"],
  ["sharingType", "Sharing Type"],
  ["length", "Length"],
  ["width", "Width"],
  ["frontage", "Frontage"],
  ["facing", "Facing"],
  ["roadWidth", "Road Width"],
  ["roadType", "Road Type"],
  ["cropSuitable", "Crop Suitable"],
  ["soilType", "Soil Type"],
  ["farmhouseCount", "Farmhouses"],
  ["maintenance", "Maintenance"],
  ["rera", "RERA Approved"],
  ["hntda", "HNTDA Approved"],
  ["warehouseType", "Warehouse Type"],
  ["builtupWarehouseArea", "Built-up Warehouse Area"],
  ["openYardArea", "Open Yard"],
  ["vehicleAccess", "Vehicle Access"],
  ["pricePerSqft", "Price per Sq.Ft"],
];

const fieldByLabel = new Map(DETAIL_FIELDS.map(([key, label]) => [label.toLowerCase(), key]));
const hasValue = value => value != null && String(value).trim() !== "";
const uniqueValues = values => [...new Map(values.filter(hasValue).map(value => [String(value).trim().toLowerCase(), String(value).trim()])).values()];

const formatMeasurement = (value, unit) => {
  const text = String(value).trim();
  if (!/^[\d,.]+$/.test(text)) return text;
  const amount = Number(text.replace(/,/g, ""));
  return `${amount.toLocaleString("en-IN")} ${unit}`;
};

export const buildPropertyDetails = property => {
  const legacy = {};
  const highlights = [];
  const facilities = [];
  for (const line of (property.description || "").split(/\r?\n/)) {
    const text = line.trim();
    if (!text) continue;
    const separator = text.indexOf(":");
    const label = text.slice(0, separator).trim().toLowerCase();
    const value = separator >= 0 ? text.slice(separator + 1).trim() : "";
    const field = separator >= 0 ? fieldByLabel.get(label) : undefined;
    if (field && value) legacy[field] = value;
    else if (label === "facilities" && value) facilities.push(...value.split(","));
    else if (label === "location" && value) legacy.location = value;
    else highlights.push(text.replace(/^(?:\p{Extended_Pictographic}|\p{Emoji_Presentation}|\uFE0F|\u200D|[\s•·–—-])+/u, ""));
  }

  const values = { ...legacy };
  for (const [key] of DETAIL_FIELDS) {
    const value = property[key] ?? property.warehouseDetails?.[key];
    if (hasValue(value)) values[key] = Array.isArray(value) ? value.join(", ") : value;
  }
  if (property.verification?.reraId) values.rera = "Yes";
  if (property.monthlyMaintenance) values.maintenance = `${property.monthlyMaintenance.toLocaleString("en-IN")} ${property.maintenanceType || ""}`.trim();

  const areaUnit = property.areaUnit === "sqm" ? "sq.m" : "sq.ft";
  const landUnit = /^(cent|cents)$/i.test(property.measurementType || "") ? "cent" : /^acre$/i.test(property.measurementType || "") ? "acre" : areaUnit;
  // Older posting forms used land area as the built-up area for plots.
  const isLand = /plot|land/i.test(property.propertyType || "");
  if (isLand && hasValue(values.landArea) && String(values.landArea).replace(/,/g, "") === String(values.builtupArea).replace(/,/g, "")) delete values.builtupArea;

  const facts = DETAIL_FIELDS.filter(([key]) => hasValue(values[key])).map(([key, label]) => {
    let value = String(values[key]);
    if (["landArea", "flatArea", "builtupArea", "builtupWarehouseArea", "openYardArea"].includes(key)) value = formatMeasurement(value, key === "landArea" ? landUnit : areaUnit);
    if (["monthlyRent", "advance", "pricePerSqft"].includes(key) && /^[\d,.]+$/.test(value)) value = currency(Number(value.replace(/,/g, "")));
    return { key, label, value };
  });
  if (property.carpetArea) facts.push({ key: "carpetArea", label: "Carpet Area", value: formatMeasurement(property.carpetArea, areaUnit) });
  if (!isLand) {
    if (property.bhk) facts.push({ key: "bedrooms", label: "Bedrooms", value: `${property.bhk} BHK` });
    if (property.bathrooms) facts.push({ key: "bathrooms", label: "Bathrooms", value: String(property.bathrooms) });
    if (property.furnishingStatus) facts.push({ key: "furnishing", label: "Furnishing", value: property.furnishingStatus });
  }
  if (property.possessionStatus) facts.push({ key: "possession", label: "Possession", value: property.possessionStatus });

  const address = uniqueValues([
    property.location?.address, property.location?.area, property.location?.village,
    property.location?.city, property.location?.taluk, property.location?.district,
    property.location?.state, property.location?.country,
  ]).join(", ") || legacy.location;

  return { facts, address, highlights: uniqueValues(highlights), amenities: uniqueValues([...(property.amenities || []), ...facilities]) };
};
