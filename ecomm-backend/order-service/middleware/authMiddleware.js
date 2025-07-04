import jwt from 'jsonwebtoken';
import fs from 'fs'
import path from 'path';

const logFile = path.join(process.cwd(), 'logs', 'latency-metrics.csv');

const JWT_SECRET = 'vulnerable-secret'; 

const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  const start = Date.now();

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token missing or invalid' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;

    const jwtVerifyTime = Date.now()-start;

    fs.appendFileSync(logFile, `${Date.now()},,,${jwtVerifyTime},\n`, 'utf-8')

    
    console.log(`✅ JWT verified for user: ${decoded.userId} (${decoded.email})`);

    next();
  } catch (err) {
    console.error('❌ Invalid token:', err.message);
    return res.status(401).json({ message: 'Token expired or invalid' });
  }
};

export default authenticate;