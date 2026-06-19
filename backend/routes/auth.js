import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';
import { validateUserForm } from '../utils/validators.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// (Normal Users Only)
router.post('/signup', async (req, res) => {
  const { name, email, password, address } = req.body;

  const errors = validateUserForm(name, email, password, address);
  if (errors.length > 0) return res.status(400).json({ errors });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      `INSERT INTO users (name, email, password_hash, address, role) 
       VALUES ($1, $2, $3, $4, 'NORMAL') RETURNING id, name, email, role`,
      [name, email, hashedPassword, address]
    );
    res.status(201).json({ message: 'User registered successfully', user: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Email already exists.' });
    res.status(500).json({ error: 'Server error during signup.' });
  }
});

// (All Users)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials.' });

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(401).json({ error: 'Invalid credentials.' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: 'Server error during login.' });
  }
});

router.post('/update-password', verifyToken, async (req, res) => {
  const { newPassword } = req.body;
  
  if (!/^(?=.*[A-Z])(?=.*[!@#$&*]).{8,16}$/.test(newPassword)) {
    return res.status(400).json({ error: 'Password does not meet requirements.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedPassword, req.user.id]);
    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update password.' });
  }
});

export default router;