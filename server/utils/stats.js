import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
const STATS_FILE = path.join(UPLOADS_DIR, 'stats.json');

function loadStats() {
  if (!fs.existsSync(STATS_FILE)) return createEmpty();
  try { return JSON.parse(fs.readFileSync(STATS_FILE, 'utf8')); }
  catch { return createEmpty(); }
}

function createEmpty() { return { visitors: { daily: {} } }; }

function saveStats(stats) {
  fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2), 'utf8');
}

export function recordVisit(ip) {
  const stats = loadStats();
  const today = new Date().toISOString().slice(0, 10);
  if (!stats.visitors) stats.visitors = { daily: {} };
  if (!stats.visitors.daily[today]) stats.visitors.daily[today] = { count: 0, ips: [] };
  const hash = crypto.createHash('sha256').update(ip || 'unknown').digest('hex').slice(0, 16);
  if (!stats.visitors.daily[today].ips.includes(hash)) {
    stats.visitors.daily[today].ips.push(hash);
    stats.visitors.daily[today].count++;
  }
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  for (const date of Object.keys(stats.visitors.daily)) {
    if (new Date(date) < cutoff) delete stats.visitors.daily[date];
  }
  saveStats(stats);
}

export function getStats(days = 30) {
  const stats = loadStats();
  const dailySeries = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dailySeries.push({ date: key, visitors: stats.visitors?.daily[key]?.count || 0 });
  }
  const today = new Date().toISOString().slice(0, 10);
  return {
    visitorsTotal: Object.values(stats.visitors?.daily || {}).reduce((s, d) => s + (d.count || 0), 0),
    todayVisitors: stats.visitors?.daily[today]?.count || 0,
    daily: dailySeries,
  };
}
