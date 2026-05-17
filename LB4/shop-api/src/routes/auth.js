const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { User } = require('../models');

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "name, email і password — обов'язкові" });

    if (await User.findOne({ where: { email } }))
      return res.status(409).json({ error: 'Email вже зареєстровано' });

    const hashed = await bcrypt.hash(password, 10);
    const user   = await User.create({ name, email, password: hashed, phone, address });
    const token  = signToken(user);

    return res.status(201).json({ token, user: safe(user) });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "email і password — обов'язкові" });

    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ error: 'Невірний email або пароль' });

    return res.json({ token: signToken(user), user: safe(user) });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function safe(user) {
  const { password, ...rest } = user.toJSON();
  return rest;
}

module.exports = router;
