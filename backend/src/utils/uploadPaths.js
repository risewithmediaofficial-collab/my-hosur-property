const path = require("path");

const uploadDir = path.resolve(__dirname, "../../uploads");

const toStoredUploadPath = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";

  if (raw.startsWith("/uploads/")) {
    return raw;
  }

  try {
    const parsed = new URL(raw);
    if (parsed.pathname.startsWith("/uploads/")) {
      return parsed.pathname;
    }
  } catch {
    // Keep falling through for non-URL values.
  }

  const normalized = raw.replace(/\\/g, "/");
  const marker = "/uploads/";
  const markerIndex = normalized.lastIndexOf(marker);

  if (markerIndex >= 0) {
    return normalized.slice(markerIndex);
  }

  return raw;
};

const normalizeUploadList = (values) =>
  (Array.isArray(values) ? values : [])
    .map(toStoredUploadPath)
    .filter(Boolean);

module.exports = {
  uploadDir,
  toStoredUploadPath,
  normalizeUploadList,
};
