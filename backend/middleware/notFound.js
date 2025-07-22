const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found - ${req.originalUrl}`,
    errors: { route: "The requested endpoint does not exist" },
    data: null,
  });
};

module.exports = notFound;
