// Middleware to limit requests per IP address

const rateLimit = require('express-rate-limit');

module.exports = rateLimit({
    windowMs: 1000 * 60 * 60, // 1 hour
    max: process.env.MAX_REQ_PER_HOUR, // Maximum number of requests per IP
    handler: function (req, res, next) {
      res.status(429).json({
        code: 429,
        error: 'Too many requests from this IP address. Please try again later.'
      });
    }
  });