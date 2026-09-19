import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";

/**
 * Global Error Handling Middleware
 */
export const errorHandler = (err, req, res, next) => {
  let error = err;

  // If error is not an instance of ApiError, normalize it
  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode || error instanceof mongoose.Error ? 400 : 500;
    const message = error.message || "Internal Server Error";
    error = new ApiError(
      statusCode,
      message,
      error?.errors || [],
      err.stack
    );
  }

  // Handle Mongoose duplicate key error (11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    error = new ApiError(409, `An account or record with that ${field} already exists.`);
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    error = new ApiError(401, "Invalid access token. Please log in again.");
  }
  if (err.name === "TokenExpiredError") {
    error = new ApiError(401, "Your session has expired. Please log in again.");
  }

  const response = {
    statusCode: error.statusCode,
    data: null,
    message: error.message,
    success: false,
    errors: error.errors,
    ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}),
  };

  return res.status(error.statusCode).json(response);
};
