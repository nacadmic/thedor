const crypto = require('crypto');

const TOKEN_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24h

function createToken(password) {
  const secret = process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || 'change-me';
  const ts = Date.now().toString();
  const sig = crypto.createHmac('sha256', secret).update(ts).digest('hex');
  return Buffer.from(ts + '.' + sig).toString('base64url');
}

function verifyToken(token) {
  if (!token) return false;
  const secret = process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || 'change-me';
  try {
    const decoded = Buffer.from(token, 'base64url').toString();
    const [ts, sig] = decoded.split('.');
    if (!ts || !sig) return false;
    const age = Date.now() - parseInt(ts, 10);
    if (age < 0 || age > TOKEN_MAX_AGE_MS) return false;
    const expected = crypto.createHmac('sha256', secret).update(ts).digest('hex');
    return sig === expected;
  } catch {
    return false;
  }
}

function getAuth(req) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) return header.slice(7);
  return null;
}

module.exports = { createToken, verifyToken, getAuth };
