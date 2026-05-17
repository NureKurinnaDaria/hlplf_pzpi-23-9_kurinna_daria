const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Рядки замовлення — зв'язок багато-до-багатьох між Order і Product
const OrderItem = sequelize.define('OrderItem', {
  id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  orderId:   { type: DataTypes.INTEGER, allowNull: false },
  productId: { type: DataTypes.INTEGER, allowNull: false },
  quantity:  { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
  price:     { type: DataTypes.DECIMAL(10, 2), allowNull: false }, // ціна на момент замовлення
}, { tableName: 'order_items', timestamps: false });

module.exports = OrderItem;
