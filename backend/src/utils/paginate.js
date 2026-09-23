const buildPagination = (page = 1, limit = 50, maxLimit = 500) => {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), maxLimit);
  const skip = (safePage - 1) * safeLimit;

  return { page: safePage, limit: safeLimit, skip };
};

module.exports = buildPagination;
