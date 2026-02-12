const { createToken } = require('./auth');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    return res.status(503).json({
      error: 'Admin not configured. Set ADMIN_PASSWORD in Vercel environment variables.',
    });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const submitted = body.password || '';

  if (submitted !== password) {
    await new Promise((r) => setTimeout(r, 2500));
    return res.status(401).json({ error: 'Invalid password' });
  }

  const token = createToken(password);
  return res.status(200).json({ ok: true, token });
};
