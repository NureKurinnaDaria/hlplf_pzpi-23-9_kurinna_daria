const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name:        { type: DataTypes.STRING(100), allowNull: false, unique: true },
  description: { type: DataTypes.TEXT, defaultValue: null },
  parentId:    { type: DataTypes.INTEGER, defaultValue: null }, // підкатегорії
}, { tableName: 'categories', timestamps: true });

module.exports = Category;
