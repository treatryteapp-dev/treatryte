const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const env = require('../config/env');
const { ApiError } = require('./errorHandler');
const userModel = require('../models/user.model');

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new ApiError(401, 'Missing or invalid Authorization header', 'UNAUTHENTICATED'));
  }

  try {
    const payload = jwt.verify(token, env.jwtAccessSecret);
    req.userId = new ObjectId(payload.sub);
    next();
  } catch {
    next(new ApiError(401, 'Invalid or expired access token', 'UNAUTHENTICATED'));
  }
}

/**
 * Must run after requireAuth (needs req.userId). Without this, provider
 * routes were only implicitly gated by whether a lab document happened to
 * exist for the caller, not by their actual role.
 */
function requireRole(role) {
  return async (req, res, next) => {
    try {
      const user = await userModel.findById(req.userId);
      if (!user || user.role !== role) {
        throw new ApiError(403, `This action requires the '${role}' role`, 'FORBIDDEN');
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { requireAuth, requireRole };
