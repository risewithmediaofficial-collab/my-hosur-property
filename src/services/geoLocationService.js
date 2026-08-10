const NOMINATIM_ENDPOINT = "https://nominatim.openstreetmap.org/search";

export const INDIA_STATE_OPTIONS = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

const uniqueStrings = (items) => [...new Set(items.map((item) => String(item || "").trim()).filter(Boolean))];

const getDefaultLocationSearch = ({ type, state, district, city }) => {
  if (type === "district") return state ? `${state} districts` : "India districts";
  if (type === "city") return district ? `${district} cities towns taluks` : state ? `${state} cities towns taluks` : "India cities towns";
  if (type === "village") return city || district || state || "India villages";
  if (type === "area") return city || district || state || "India localities";
  return "";
};

const buildLocationQuery = ({ type, search, state, district, city, village }) => {
  const searchTerm = search || getDefaultLocationSearch({ type, state, district, city });
  const parts = [searchTerm];

  if (type === "state") parts.push("state");
  if (type === "district") parts.push("district", state);
  if (type === "city") parts.push("city", district, state);
  if (type === "village") parts.push("village", city, district, state);
  if (type === "area") parts.push("locality", village, city, district, state);

  parts.push("India");
  return uniqueStrings(parts).join(", ");
};

const pickAddressValue = (address, type) => {
  if (!address) return "";

  if (type === "state") return address.state;
  if (type === "district") return address.state_district || address.county || address.district;
  if (type === "city") return address.city || address.town || address.municipality || address.county || address.state_district;
  if (type === "village") return address.village || address.hamlet || address.town || address.city || address.suburb;
  if (type === "area") return address.suburb || address.neighbourhood || address.quarter || address.residential || address.locality || address.road || address.city_district;

  return "";
};

export const searchIndiaLocationNames = async ({ type, search = "", state = "", district = "", city = "", village = "" }) => {
  const trimmedSearch = search.trim();
  if (!trimmedSearch && type === "state") return INDIA_STATE_OPTIONS;
  if (!trimmedSearch && !["district", "city", "village", "area"].includes(type)) return [];

  const params = new URLSearchParams({
    q: buildLocationQuery({ type, search: trimmedSearch, state, district, city, village }),
    format: "jsonv2",
    addressdetails: "1",
    countrycodes: "in",
    limit: "50",
  });

  const response = await fetch(`${NOMINATIM_ENDPOINT}?${params.toString()}`);
  if (!response.ok) return [];

  const items = await response.json();
  const names = uniqueStrings((items || []).map((item) => pickAddressValue(item.address, type)));

  if (type === "state") {
    return INDIA_STATE_OPTIONS.filter((stateName) => stateName.toLowerCase().includes(trimmedSearch.toLowerCase()));
  }

  return names;
};
