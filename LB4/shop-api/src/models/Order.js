const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id:         { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId:     { type: DataTypes.INTEGER, allowNull: false },
  status:     {
    type: DataTypes.ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled'),
    defaultValue: 'pending',
  },
  totalPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  address:    { type: DataTypes.TEXT, allowNull: false },
  comment:    { type: DataTypes.TEXT, defaultValue: null },
}, {
  tableName: 'orders',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['status'] },
  ],
});

module.exports = Order;
