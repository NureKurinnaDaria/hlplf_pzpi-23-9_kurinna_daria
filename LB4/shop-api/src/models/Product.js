const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  categoryId:  { type: DataTypes.INTEGER, allowNull: false },
  name:        { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT, defaultValue: null },
  price:       { type: DataTypes.DECIMAL(10, 2), allowNull: false, validate: { min: 0 } },
  stock:       { type: DataTypes.INTEGER, defaultValue: 0, validate: { min: 0 } },
  imageUrl:    { type: DataTypes.STRING, defaultValue: null },
  isActive:    { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'products',
  timestamps: true,
  // Рівень 3: індекси для оптимізації
  indexes: [
    { fields: ['categoryId'] },
    { fields: ['price'] },
    { fields: ['name'] },
    { fields: ['isActive'] },
  ],
});

module.exports = Product;
