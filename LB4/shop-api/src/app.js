require('dotenv').config();
const express = require('express');
const { sequelize } = require('./models');

const authRoutes       = require('./routes/auth');
const categoriesRoutes = require('./routes/categories');
const productsRoutes   = require('./routes/products');
const ordersRoutes     = require('./routes/orders');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json());

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/products',   productsRoutes);
app.use('/api/orders',     ordersRoutes);

// Health check
app.get('/', (req, res) => res.json({ message: 'Shop API працює ✅' }));

// 404
app.use((req, res) => res.status(404).json({ error: 'Маршрут не знайдено' }));

// ─── Start ────────────────────────────────────────────────────────────────────
sequelize.sync({ alter: true }) // alter: true — оновлює схему без дропу даних
  .then(() => {
    console.log('✅ БД синхронізована');
    app.listen(PORT, () => console.log(`🚀 Сервер запущено: http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('❌ Помилка підключення до БД:', err);
    process.exit(1);
  });
