import express from 'express';
import db from '../config/db.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(verifyToken, requireRole(['NORMAL']));


router.get('/stores', async (req, res) => {
  const { search, sortBy = 'name', order = 'ASC' } = req.query;
  const userId = req.user.id;
  
  const validSortCols = ['name', 'address', 'overall_rating'];
  const sortCol = validSortCols.includes(sortBy) ? sortBy : 'name';
  const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  try {
    let query = `
      SELECT s.id, s.name, s.address,
      (SELECT COALESCE(ROUND(AVG(rating), 2), 0) FROM ratings WHERE store_id = s.id) as overall_rating,
      (SELECT rating FROM ratings WHERE store_id = s.id AND user_id = $1) as user_rating
      FROM stores s
      WHERE 1=1
    `;
    const params = [userId];
    let paramIndex = 2;

    if (search) {
      query += ` AND (s.name ILIKE $${paramIndex} OR s.address ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY ${sortCol} ${sortOrder}`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stores.' });
  }
});


router.post('/stores/:storeId/rate', async (req, res) => {
  const { storeId } = req.params;
  const { rating } = req.body;
  const userId = req.user.id;

  if (rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be between 1 and 5.' });

  try {
    await db.query(`
      INSERT INTO ratings (user_id, store_id, rating, updated_at) 
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, store_id) 
      DO UPDATE SET rating = EXCLUDED.rating, updated_at = CURRENT_TIMESTAMP
    `, [userId, storeId, rating]);

    res.json({ message: 'Rating submitted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit rating.' });
  }
});

export default router;