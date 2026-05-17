const express  = require('express');
const { Op, fn, col } = require('sequelize');
const { Product, Category, Review, User } = require('../models');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/products — пошук, фільтрація, сортування, пагінація (Рівень 3)
router.get('/', async (req, res) => {
  try {
    const {
      search,
      categoryId,
      minPrice,
      maxPrice,
      sortBy  = 'createdAt',
      order   = 'DESC',
      page    = 1,
      limit   = 10,
    } = req.query;

    const where = { isActive: true };

    // Пошук по назві та опису (Рівень 3: фільтрація)
    if (search) {
      where[Op.or] = [
        { name:        { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    if (categoryId) where.categoryId = parseInt(categoryId);

    // Фільтрація по ціні (Рівень 3)
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
    }

    const validSort  = ['name', 'price', 'createdAt'];
    const validOrder = ['ASC', 'DESC'];
    const safeSort  = validSort.includes(sortBy) ? sortBy : 'createdAt';
    const safeOrder = validOrder.includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Eager loading з агрегацією рейтингу (Рівень 3: оптимізація)
    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [
        { model: Category, attributes: ['id', 'name'] },
        {
          model: Review,
          attributes: [],  // не тягнемо дані — тільки агрегат
          required: false,
        },
      ],
      attributes: {
        include: [
          [fn('AVG', col('Reviews.rating')), 'avgRating'],
          [fn('COUNT', col('Reviews.id')),   'reviewCount'],
        ],
      },
      group: ['Product.id'],
      order:  [[safeSort, safeOrder]],
      limit:  parseInt(limit),
      offset,
      subQuery: false,
      distinct: true,
    });

    return res.json({
      total:      count.length,
      page:       parseInt(page),
      totalPages: Math.ceil(count.length / parseInt(limit)),
      products:   rows,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Category, attributes: ['id', 'name'] },
        {
          model: Review,
          include: [{ model: User, attributes: ['id', 'name'] }],
          limit: 10,
          order: [['createdAt', 'DESC']],
        },
      ],
    });
    if (!product) return res.status(404).json({ error: 'Товар не знайдено' });
    return res.json(product);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/products — тільки адмін
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { categoryId, name, description, price, stock, imageUrl } = req.body;
    if (!categoryId || !name || price === undefined)
      return res.status(400).json({ error: "categoryId, name, price — обов'язкові" });

    const product = await Product.create({ categoryId, name, description, price, stock, imageUrl });
    return res.status(201).json(product);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/products/:id — тільки адмін
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Товар не знайдено' });

    await product.update(req.body);
    return res.json(product);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/products/:id — тільки адмін (soft delete)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Товар не знайдено' });

    await product.update({ isActive: false });
    return res.json({ message: 'Товар деактивовано' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/products/:id/reviews — додати відгук
router.post('/:id/reviews', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Товар не знайдено' });

    const { rating, comment } = req.body;
    if (!rating) return res.status(400).json({ error: "rating — обов'язковий (1-5)" });

    const review = await Review.create({
      productId: product.id,
      userId: req.user.id,
      rating,
      comment,
    });
    return res.status(201).json(review);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError')
      return res.status(409).json({ error: 'Ви вже залишили відгук на цей товар' });
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
