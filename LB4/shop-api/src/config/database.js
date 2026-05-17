const { Sequelize } = require('sequelize');
const path = require('path');

// За замовчуванням SQLite (простіше для розробки)
// Щоб використати PostgreSQL — постав DATABASE_URL в .env
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, { logging: false })
  : new Sequelize({
      dialect: 'sqlite',
      storage: path.join(__dirname, '../../database.sqlite'),
      logging: false,
    });

module.exports = sequelize;
