/**
 * Authentication middleware for role-based access control
 */

/**
 * Ensures user is authenticated
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error_msg", "Please log in to access this resource")
  res.redirect("/auth/login")
}

/**
 * Ensures user has buyer role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.ensureBuyer = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === "buyer") {
    return next();
  }
  req.flash("error_msg", "You are not authorized to access this resource")
  res.redirect("/")
}

/**
 * Ensures user has seller role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.ensureSeller = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === "seller") {
    return next();
  }
  req.flash("error_msg", "You are not authorized to access this resource")
  res.redirect("/")
}

/**
 * Ensures user has admin role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.ensureAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === "admin") {
    return next();
  }
  req.flash("error_msg", "You are not authorized to access this resource")
  res.redirect("/")
}

/**
 * Ensures user is not authenticated (for login/register pages)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.ensureNotAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect("/")
}

