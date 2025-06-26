// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'vulnerable-secret'; // Same as in auth-service

const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token missing or invalid' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;

    // ✅ Log successful verification
    console.log(`✅ JWT verified for user: ${decoded.userId} (${decoded.email})`);

    next();
  } catch (err) {
    console.error('❌ Invalid token:', err.message);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export default authenticate;