const path = require('path');
const fs = require('fs');
const { list, put } = require('@vercel/blob');
const { verifyToken, getAuth } = require('./auth');

const CONTENT_KEY = 'content.json';

function getDefaultContent() {
  const filePath = path.join(process.cwd(), 'content', 'default.json');
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

async function getStoredContent() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
  try {
    const { blobs } = await list({ prefix: 'content' });
    const found = blobs.find((b) => b.pathname === CONTENT_KEY);
    if (!found || !found.url) return null;
    const res = await fetch(found.url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    try {
      const stored = await getStoredContent();
      const data = stored || getDefaultContent();
      return res.status(200).json(data);
    } catch (e) {
      return res.status(500).json({ error: 'Failed to load content' });
    }
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    const token = getAuth(req);
    if (!verifyToken(token)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return res.status(503).json({
        error: 'Storage not configured. Add BLOB_READ_WRITE_TOKEN in Vercel project settings.',
      });
    }
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const defaultContent = getDefaultContent();
      function deepMerge(target, src) {
        if (src === null || typeof src !== 'object' || Array.isArray(src)) return src;
        const out = { ...target };
        for (const k of Object.keys(src)) {
          out[k] = (target[k] && typeof target[k] === 'object' && !Array.isArray(target[k]) && src[k] && typeof src[k] === 'object')
            ? deepMerge(target[k], src[k]) : src[k];
        }
        return out;
      }
      const merged = deepMerge(defaultContent, body);
      const blob = await put(CONTENT_KEY, JSON.stringify(merged), {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
      });
      return res.status(200).json({ ok: true, url: blob.url });
    } catch (e) {
      return res.status(500).json({ error: e.message || 'Failed to save' });
    }
  }

  return res.status(405).end();
};
