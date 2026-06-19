import express from 'express';
import bcrypt from 'bcrypt';
import db from '../config/db.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';
import { validateUserForm } from '../utils/validators.js';

const router = express.Router();
router.use(verifyToken, requireRole(['ADMIN']));

// Dashboard Metrics
router.get('/dashboard', async (req, res) => {
  try {
    const usersCount = await db.query('SELECT COUNT(*) FROM users');
    const storesCount = await db.query('SELECT COUNT(*) FROM stores');
    const ratingsCount = await db.query('SELECT COUNT(*) FROM ratings');

    res.json({
      totalUsers: parseInt(usersCount.rows[0].count),
      totalStores: parseInt(storesCount.rows[0].count),
      totalRatings: parseInt(ratingsCount.rows[0].count)
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dashboard metrics.' });
  }
});

// Add New User (Admin, Normal, or Owner)
router.post('/users', async (req, res) => {
  const { name, email, password, address, role } = req.body;
  const errors = validateUserForm(name, email, password, address);
  if (errors.length > 0) return res.status(400).json({ errors });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      `INSERT INTO users (name, email, password_hash, address, role) VALUES ($1, $2, $3, $4, $5)`,
      [name, email, hashedPassword, address, role || 'NORMAL']
    );
    res.status(201).json({ message: 'User added successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add user.' });
  }
});

// Add New Store
router.post('/stores', async (req, res) => {
  const { owner_id, name, email, address } = req.body;
  try {
    await db.query(
      `INSERT INTO stores (owner_id, name, email, address) VALUES ($1, $2, $3, $4)`,
      [owner_id, name, email, address]
    );
    res.status(201).json({ message: 'Store added successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add store.' });
  }
});

// List Users with Sorting, Filtering, and Store Owner Ratings
router.get('/users', async (req, res) => {
  const { search, role, sortBy = 'name', order = 'ASC' } = req.query;
  const validSortCols = ['name', 'email', 'address', 'role'];
  const sortCol = validSortCols.includes(sortBy) ? sortBy : 'name';
  const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  try {
    let query = `
      SELECT u.id, u.name, u.email, u.address, u.role,
      CASE WHEN u.role = 'STORE_OWNER' THEN (
          SELECT COALESCE(ROUND(AVG(r.rating), 2), 0) 
          FROM ratings r 
          JOIN stores s ON r.store_id = s.id 
          WHERE s.owner_id = u.id
      ) ELSE NULL END as store_rating
      FROM users u
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND (u.name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex} OR u.address ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    if (role) {
      query += ` AND u.role = $${paramIndex}`;
      params.push(role);
      paramIndex++;
    }

    query += ` ORDER BY u.${sortCol} ${sortOrder}`;
    
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

// List Stores with Sorting, Filtering, and Ratings
router.get('/stores', async (req, res) => {
  const { search, sortBy = 'name', order = 'ASC' } = req.query;
  const validSortCols = ['name', 'email', 'address', 'rating'];
  const sortCol = validSortCols.includes(sortBy) ? (sortBy === 'rating' ? 'rating' : `s.${sortBy}`) : 's.name';
  const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  try {
    let query = `
      SELECT s.id, s.name, s.email, s.address, 
      COALESCE(ROUND(AVG(r.rating), 2), 0) as rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND (s.name ILIKE $${paramIndex} OR s.email ILIKE $${paramIndex} OR s.address ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` GROUP BY s.id ORDER BY ${sortCol} ${sortOrder}`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stores.' });
  }
});

export default router;