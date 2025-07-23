import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export const authenticate = (req, res, next) => {
  // console.log(" this is the header " ,req.headers);
  
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;  // attach to request for downstream use
    next();

  } catch (err) {
    console.error('Auth middleware error:', err.name);

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired, please login again.' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Invalid token signature – don't try to hack! 😅" });
    }

    // if (err.name === '') {
    //   return res.status(401).json({ message: 'Token expired, please login again.' });
    // }
    // fallback for other unexpected errors
    return res.status(401).json({ message: 'Authentication failed.' });
  }
};
