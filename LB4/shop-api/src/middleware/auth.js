const jwt = require('jsonwebtoken');

// Рівень 4: перевірка JWT токена
const authMiddleware = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Bearer <token>
  if (!token) return res.status(401).json({ error: 'Токен відсутній. Авторизуйтесь.' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(403).json({ error: 'Токен недійсний або прострочений.' });
  }
};

// Рівень 4: лише для адмінів
const adminMiddleware = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Доступ лише для адміністраторів.' });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };
