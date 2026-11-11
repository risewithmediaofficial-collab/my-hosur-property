const axios = require("axios");

const DEFAULT_SALESDADDY_BASE_URL = "https://api.salesdaddy.in";
const DEFAULT_LEAD_SOURCE = "website";
const REQUEST_TIMEOUT_MS = 10000;

const getSalesDaddyConfig = () => ({
  apiKey: String(process.env.SALESDADDY_API_KEY || "").trim(),
  baseUrl: String(process.env.SALESDADDY_API_BASE_URL || DEFAULT_SALESDADDY_BASE_URL)
    .trim()
    .replace(/\/+$/, ""),
  source: String(process.env.SALESDADDY_LEAD_SOURCE || DEFAULT_LEAD_SOURCE).trim() || DEFAULT_LEAD_SOURCE,
});

const extractPhoneDigits = (rawPhone = "") => String(rawPhone || "").replace(/\D/g, "");

const normalizeMobile = (rawPhone = "") => {
  const trimmed = String(rawPhone || "").trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = extractPhoneDigits(trimmed);

  if (!digits) return "";
  if (hasPlus) return `+${digits}`.slice(0, 20);
  if (digits.length === 11 && digits.startsWith("0")) {
    return digits.slice(1);
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+${digits}`;
  }
  return digits.slice(0, 20);
};

const buildSalesDaddyLeadPayload = ({
  name,
  email,
  phone,
  mobile,
  message,
  sourcePage = "/contact",
  tags = ["Contact Page"],
  source,
  custom = {},
} = {}) => {
  const cleanName = String(name || "").trim().slice(0, 200);
  const normalizedMobile = normalizeMobile(mobile || phone);
  const cleanEmail = String(email || "").trim().toLowerCase().slice(0, 320);
  const cleanMessage = String(message || "").trim();
  const config = getSalesDaddyConfig();

  const payload = {
    name: cleanName,
    mobile: normalizedMobile,
    source: String(source || config.source || DEFAULT_LEAD_SOURCE).trim().slice(0, 60),
    voiceConsent: "opted_in",
    note: (cleanMessage || "Enquiry submitted from MyHosurProperty Contact Page").slice(0, 2000),
    custom: {
      page: sourcePage,
      ...custom,
    },
  };

  if (cleanEmail) {
    payload.email = cleanEmail;
  }

  const sanitizedTags = (Array.isArray(tags) ? tags : [tags])
    .map((item) => String(item || "").trim().slice(0, 50))
    .filter(Boolean)
    .slice(0, 20);

  if (sanitizedTags.length > 0) {
    payload.tags = sanitizedTags;
  }

  return payload;
};

const createSalesDaddyLead = async (leadInput) => {
  const { apiKey, baseUrl } = getSalesDaddyConfig();

  if (!apiKey) {
    const err = new Error("Sales Daddy CRM integration is not configured on the server.");
    err.statusCode = 503;
    err.code = "SALESDADDY_NOT_CONFIGURED";
    throw err;
  }

  const payload = buildSalesDaddyLeadPayload(leadInput);

  if (!payload.name || !payload.mobile) {
    const err = new Error("Name and valid mobile number are required for CRM lead capture.");
    err.statusCode = 400;
    err.code = "INVALID_CRM_LEAD_PAYLOAD";
    throw err;
  }

  try {
    const response = await axios.post(`${baseUrl}/v1/ext/leads`, payload, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      timeout: REQUEST_TIMEOUT_MS,
    });

    const data = response?.data || {};
    if (data.ok === false) {
      const apiErr = new Error(data.message || "Unable to register contact enquiry in CRM.");
      apiErr.statusCode = 422;
      apiErr.code = data.error || "SALESDADDY_REJECTED";
      throw apiErr;
    }

    return data;
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }

    const upstreamStatus = error?.response?.status;
    const upstreamData = error?.response?.data || {};
    const upstreamCode = upstreamData.error || "SALESDADDY_API_ERROR";

    if (upstreamStatus === 400 || upstreamStatus === 422) {
      const validationErr = new Error(
        upstreamCode === "invalid_number"
          ? "Please enter a valid 10-digit mobile number."
          : upstreamData.message || "Invalid contact details submitted."
      );
      validationErr.statusCode = 422;
      validationErr.code = upstreamCode;
      throw validationErr;
    }

    const serviceErr = new Error("Unable to forward enquiry to CRM right now. Please try again shortly.");
    serviceErr.statusCode = 502;
    serviceErr.code = upstreamCode;
    serviceErr.details = upstreamData.message || error.message;
    throw serviceErr;
  }
};

module.exports = {
  buildSalesDaddyLeadPayload,
  createSalesDaddyLead,
  extractPhoneDigits,
  getSalesDaddyConfig,
  normalizeMobile,
};

