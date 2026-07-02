const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const env = require('../config/env');
const { ApiError } = require('./errorHandler');

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

module.exports = { requireAuth };
