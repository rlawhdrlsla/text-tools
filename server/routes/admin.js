import express from 'express';
import { getStats } from '../utils/stats.js';

const router = express.Router();

function adminAuth(req, res, next) {
  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey) return res.status(503).json({ error: 'ADMIN_KEY not configured' });
  if (req.headers['x-admin-key'] !== adminKey) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

router.post('/verify', adminAuth, (req, res) => res.json({ ok: true }));
router.get('/stats', adminAuth, (req, res) => {
  const days = parseInt(req.query.days) || 30;
  res.json(getStats(days));
});

export default router;
