const jwt = require('jsonwebtoken');
const JWT_SECRET = '1234';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Token missing.' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token invalid or expired.' });
    }

    req.user = user; // Add user info to request object
    next();
  });
};

module.exports = authenticateToken;
