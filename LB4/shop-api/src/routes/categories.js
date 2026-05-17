const express  = require('express');
const { Category, Product } = require('../models');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/categories — всі категорії з підкатегоріями
router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { parentId: null }, // тільки кореневі
      include: [{ model: Category, as: 'subcategories' }],
    });
    return res.json(categories);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/categories/:id
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'subcategories' },
        { model: Product, where: { isActive: true }, required: false, limit: 10 },
      ],
    });
    if (!category) return res.status(404).json({ error: 'Категорію не знайдено' });
    return res.json(category);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/categories — тільки адмін
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, description, parentId } = req.body;
    if (!name) return res.status(400).json({ error: "name — обов'язкове" });

    const category = await Category.create({ name, description, parentId: parentId || null });
    return res.status(201).json(category);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError')
      return res.status(409).json({ error: 'Категорія з такою назвою вже існує' });
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/categories/:id — тільки адмін
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: 'Категорію не знайдено' });

    await category.update(req.body);
    return res.json(category);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/categories/:id — тільки адмін
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: 'Категорію не знайдено' });

    await category.destroy();
    return res.json({ message: 'Категорію видалено' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
