const express  = require('express');
const { sequelize, Order, OrderItem, Product, User } = require('../models');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/orders — свої замовлення (або всі для адміна)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const where = req.user.role === 'admin' ? {} : { userId: req.user.id };

    const orders = await Order.findAll({
      where,
      include: [
        {
          model: Product,
          through: { model: OrderItem, attributes: ['quantity', 'price'] },
          attributes: ['id', 'name', 'imageUrl'],
        },
        { model: User, attributes: ['id', 'name', 'email'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    return res.json(orders);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        {
          model: Product,
          through: { model: OrderItem, attributes: ['quantity', 'price'] },
        },
        { model: User, attributes: ['id', 'name', 'email', 'phone'] },
      ],
    });

    if (!order) return res.status(404).json({ error: 'Замовлення не знайдено' });

    // Лише власник або адмін
    if (order.userId !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Доступ заборонено' });

    return res.json(order);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/orders — створити замовлення (Рівень 4: транзакція)
router.post('/', authMiddleware, async (req, res) => {
  const transaction = await sequelize.transaction(); // Транзакція — всі кроки або нічого

  try {
    const { items, address, comment } = req.body;
    // items: [{ productId, quantity }, ...]

    if (!items?.length || !address)
      return res.status(400).json({ error: "items та address — обов'язкові" });

    // 1. Перевіряємо наявність товарів та рахуємо суму
    let totalPrice = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findByPk(item.productId, { transaction });

      if (!product || !product.isActive)
        throw new Error(`Товар #${item.productId} не знайдено`);

      if (product.stock < item.quantity)
        throw new Error(`Недостатньо товару "${product.name}" на складі (є: ${product.stock})`);

      totalPrice += parseFloat(product.price) * item.quantity;
      orderItems.push({ productId: product.id, quantity: item.quantity, price: product.price });
    }

    // 2. Створюємо замовлення
    const order = await Order.create(
      { userId: req.user.id, totalPrice, address, comment, status: 'pending' },
      { transaction }
    );

    // 3. Створюємо рядки замовлення
    await OrderItem.bulkCreate(
      orderItems.map(i => ({ ...i, orderId: order.id })),
      { transaction }
    );

    // 4. Зменшуємо stock кожного товару
    for (const item of orderItems) {
      await Product.decrement('stock', {
        by: item.quantity,
        where: { id: item.productId },
        transaction,
      });
    }

    await transaction.commit(); // ✅ Все пройшло — фіксуємо

    return res.status(201).json({ message: 'Замовлення створено', orderId: order.id });
  } catch (err) {
    await transaction.rollback(); // ❌ Щось пішло не так — відкочуємо всі зміни
    return res.status(400).json({ error: err.message });
  }
});

// PUT /api/orders/:id/status — змінити статус (адмін)
router.put('/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status))
      return res.status(400).json({ error: `Статус має бути: ${validStatuses.join(', ')}` });

    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Замовлення не знайдено' });

    await order.update({ status });
    return res.json(order);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/orders/:id — скасувати замовлення (лише pending)
router.delete('/:id', authMiddleware, async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: OrderItem }],
      transaction,
    });

    if (!order) throw new Error('Замовлення не знайдено');
    if (order.userId !== req.user.id && req.user.role !== 'admin')
      throw new Error('Доступ заборонено');
    if (order.status !== 'pending')
      throw new Error('Можна скасувати лише замовлення зі статусом pending');

    // Повертаємо stock товарам
    for (const item of order.OrderItems) {
      await Product.increment('stock', {
        by: item.quantity,
        where: { id: item.productId },
        transaction,
      });
    }

    await order.update({ status: 'cancelled' }, { transaction });
    await transaction.commit();

    return res.json({ message: 'Замовлення скасовано' });
  } catch (err) {
    await transaction.rollback();
    return res.status(400).json({ error: err.message });
  }
});

module.exports = router;
