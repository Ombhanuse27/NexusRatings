import express from 'express';
import db from '../config/db.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(verifyToken, requireRole(['STORE_OWNER']));


router.get('/dashboard', async (req, res) => {
  const ownerId = req.user.id;

  try {
  
    const storeResult = await db.query('SELECT id, name FROM stores WHERE owner_id = $1', [ownerId]);
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'No store associated with this owner.' });
    }
    const storeId = storeResult.rows[0].id;


    const avgResult = await db.query(
      'SELECT COALESCE(ROUND(AVG(rating), 2), 0) as average_rating FROM ratings WHERE store_id = $1',
      [storeId]
    );


    const ratersResult = await db.query(`
      SELECT u.name, u.email, r.rating, r.updated_at
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = $1
      ORDER BY r.updated_at DESC
    `, [storeId]);

    res.json({
      storeName: storeResult.rows[0].name,
      averageRating: parseFloat(avgResult.rows[0].average_rating),
      raters: ratersResult.rows
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch owner dashboard data.' });
  }
});

export default router;