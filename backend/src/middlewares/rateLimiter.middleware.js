import rateLimit from "express-rate-limit";

// Rate limiter for payment attempts (max 10 requests per minute per IP to prevent card testing)
export const paymentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    statusCode: 429,
    data: null,
    message: "Too many payment requests from this IP, please try again in a minute.",
    success: false,
  },
});

// Rate limiter for authentication attempts (max 20 requests per 15 minutes)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    statusCode: 429,
    data: null,
    message: "Too many login/registration attempts, please try again after 15 minutes.",
    success: false,
  },
});

// General API rate limiter (150 requests per 5 minutes)
export const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
});
