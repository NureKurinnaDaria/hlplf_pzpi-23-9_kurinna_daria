const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Review = sequelize.define('Review', {
  id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  productId: { type: DataTypes.INTEGER, allowNull: false },
  userId:    { type: DataTypes.INTEGER, allowNull: false },
  rating:    { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
  comment:   { type: DataTypes.TEXT, defaultValue: null },
}, {
  tableName: 'reviews',
  timestamps: true,
  indexes: [
    { fields: ['productId'] },
    { unique: true, fields: ['userId', 'productId'] }, // один відгук на товар
  ],
});

module.exports = Review;
