const sequelize = require('../config/database');
const User      = require('./User');
const Category  = require('./Category');
const Product   = require('./Product');
const Order     = require('./Order');
const OrderItem = require('./OrderItem');
const Review    = require('./Review');

// ─── Асоціації ────────────────────────────────────────────────────────────────

// Category → Products (один-до-багатьох)
Category.hasMany(Product, { foreignKey: 'categoryId', onDelete: 'RESTRICT' });
Product.belongsTo(Category, { foreignKey: 'categoryId' });

// Category → SubCategories (self-referencing)
Category.hasMany(Category, { foreignKey: 'parentId', as: 'subcategories' });
Category.belongsTo(Category, { foreignKey: 'parentId', as: 'parent' });

// User → Orders (один-до-багатьох)
User.hasMany(Order, { foreignKey: 'userId', onDelete: 'CASCADE' });
Order.belongsTo(User, { foreignKey: 'userId' });

// Order ↔ Product (багато-до-багатьох через OrderItem)
Order.belongsToMany(Product, { through: OrderItem, foreignKey: 'orderId' });
Product.belongsToMany(Order, { through: OrderItem, foreignKey: 'productId' });
Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

// User → Reviews (один-до-багатьох)
User.hasMany(Review, { foreignKey: 'userId', onDelete: 'CASCADE' });
Review.belongsTo(User, { foreignKey: 'userId', attributes: ['id', 'name'] });

// Product → Reviews (один-до-багатьох)
Product.hasMany(Review, { foreignKey: 'productId', onDelete: 'CASCADE' });
Review.belongsTo(Product, { foreignKey: 'productId' });

module.exports = { sequelize, User, Category, Product, Order, OrderItem, Review };
