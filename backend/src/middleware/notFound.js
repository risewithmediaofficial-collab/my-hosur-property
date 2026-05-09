const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
    path: req.originalUrl,
  });
};

module.exports = notFound;
