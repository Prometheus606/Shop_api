const router = require("express").Router();

// Middleware for custom error handling for not found routes
router.use((req, res, next) => {
  res.status(404).json({
    success: false,
    code: 404,
    error: 'The route was not found!'
  });
});

// Middleware for general error handling
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    code: 500,
    error: 'Something went wrong!'
  });
});

module.exports = router