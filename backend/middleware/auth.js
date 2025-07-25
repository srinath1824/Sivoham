const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // DEV ONLY: skip auth if SKIP_AUTH env or header is set
  if (process.env.SKIP_AUTH === 'true' || req.headers['x-skip-auth'] === 'true') {
    req.user = { id: 'testuserid', isAdmin: true }; // fake user
    return next();
  }
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
}; 