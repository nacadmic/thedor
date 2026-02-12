const { put } = require('@vercel/blob');
const { verifyToken, getAuth } = require('./auth');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const token = getAuth(req);
  if (!verifyToken(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(503).json({
      error: 'Storage not configured. Add BLOB_READ_WRITE_TOKEN in Vercel.',
    });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const key = body.key || '1';
    const dataUrl = body.dataUrl || body.image;
    if (!dataUrl || typeof dataUrl !== 'string') {
      return res.status(400).json({ error: 'Send JSON: { key: "1", dataUrl: "data:image/jpeg;base64,..." }' });
    }
    const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) {
      return res.status(400).json({ error: 'dataUrl must be data:type;base64,...' });
    }
    const ext = (match[1].split('/')[1] || 'jpg').replace('jpeg', 'jpg');
    const pathname = `images/${key}.${ext}`;
    const buf = Buffer.from(match[2], 'base64');
    const blob = await put(pathname, buf, {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: match[1],
    });
    return res.status(200).json({ ok: true, url: blob.url });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Upload failed' });
  }
};
