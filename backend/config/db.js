import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: { require: true }
});

export default {
  query: (text, params) => pool.query(text, params),
};