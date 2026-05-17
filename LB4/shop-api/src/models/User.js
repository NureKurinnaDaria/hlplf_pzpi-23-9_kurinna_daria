const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id:       { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name:     { type: DataTypes.STRING(100), allowNull: false },
  email:    { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
  password: { type: DataTypes.STRING, allowNull: false },
  role:     { type: DataTypes.ENUM('user', 'admin'), defaultValue: 'user' },
  phone:    { type: DataTypes.STRING(20), defaultValue: null },
  address:  { type: DataTypes.TEXT, defaultValue: null },
}, { tableName: 'users', timestamps: true });

module.exports = User;
