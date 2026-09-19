import { validationResult } from "express-validator";
import { ApiError } from "../utils/ApiError.js";

/**
 * Validates incoming request against express-validator rules
 */
export const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = [];
    errors.array().map((err) => extractedErrors.push({ [err.path]: err.msg }));

    return next(new ApiError(422, "Received data is not valid", extractedErrors));
  };
};
