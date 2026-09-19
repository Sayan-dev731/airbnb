import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * @desc    Health check endpoint
 * @route   GET /api/v1/health
 * @access  Public
 */
export const healthCheck = asyncHandler(async (req, res) => {
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: `${process.uptime().toFixed(2)}s`,
        service: "Airbnb Core API Engine",
        version: "1.0.0",
      },
      "Airbnb backend service is healthy and running"
    )
  );
});
