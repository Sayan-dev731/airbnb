import { ApiError } from "../utils/ApiError.js";
import { USER_ROLES } from "../utils/constants.js";

/**
 * Role-Based Access Control (RBAC) middleware
 * @param  {...string} roles - Allowed roles e.g. 'admin', 'host', 'user'
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new ApiError(401, "Authentication required to access this resource")
      );
    }

    // Admin has superuser privileges across all routes
    if (req.user.role === USER_ROLES.ADMIN) {
      return next();
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Access Denied: Role '${req.user.role}' is not authorized to access this resource. Required: ${roles.join(", ")}`
        )
      );
    }

    next();
  };
};
