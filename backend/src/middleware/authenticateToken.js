const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate a JWT token.
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  console.log("🛂 Incoming Auth Header:", authHeader);

  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.warn('🚫 No token provided');
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('❌ Token verification failed:', err.message);
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    console.log('✅ Token verified. Decoded payload:', user);
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };
