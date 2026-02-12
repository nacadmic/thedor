const { createToken } = require('./auth');

const REDIRECT_URI = process.env.KAKAO_REDIRECT_URI || '';
const REST_KEY = process.env.KAKAO_REST_KEY || '';
const CLIENT_SECRET = process.env.KAKAO_CLIENT_SECRET || '';
const ALLOWED_EMAILS = (process.env.ALLOWED_ADMIN_EMAILS || '')
  .split(/[\s,]+/)
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);
const ALLOWED_IDS = (process.env.ALLOWED_KAKAO_IDS || '')
  .split(/[\s,]+/)
  .map((s) => String(s).trim())
  .filter(Boolean);

function isAllowed(email, kakaoId) {
  if (ALLOWED_IDS.length && kakaoId && ALLOWED_IDS.includes(String(kakaoId))) return true;
  if (ALLOWED_EMAILS.length && email) return ALLOWED_EMAILS.includes(String(email).trim().toLowerCase());
  return false;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  if (!REST_KEY || !REDIRECT_URI || (ALLOWED_EMAILS.length === 0 && ALLOWED_IDS.length === 0)) {
    return res.status(503).json({
      error: 'Kakao admin login not configured. Set KAKAO_REST_KEY, KAKAO_REDIRECT_URI, and ALLOWED_ADMIN_EMAILS or ALLOWED_KAKAO_IDS.',
    });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
  const code = body.code || '';
  const redirectUri = REDIRECT_URI;

  if (!code) {
    return res.status(400).json({ error: 'Missing code' });
  }

  try {
    const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: REST_KEY,
        redirect_uri: redirectUri,
        code,
        ...(CLIENT_SECRET && { client_secret: CLIENT_SECRET }),
      }).toString(),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      return res.status(401).json({
        error: tokenData.error_description || tokenData.error || 'Kakao token failed',
        kakaoError: tokenData.error,
        kakaoErrorCode: tokenData.code,
      });
    }

    const meRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const me = await meRes.json();
    if (!meRes.ok) {
      return res.status(401).json({
        error: me.msg || me.error_description || 'Failed to get user info',
        kakaoError: me.code || me.error,
      });
    }

    const email = (me.kakao_account && me.kakao_account.email) || '';
    const kakaoId = me.id ? String(me.id) : '';
    if (!isAllowed(email, kakaoId)) {
      return res.status(403).json({
        error: '이 계정은 관리자로 등록되어 있지 않습니다. Vercel 환경변수 ALLOWED_ADMIN_EMAILS 또는 ALLOWED_KAKAO_IDS에 아래 값을 추가하세요.',
        received: { email: email || '(없음)', kakaoId: kakaoId || '(없음)' },
      });
    }

    const token = createToken();
    return res.status(200).json({ ok: true, token });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Server error' });
  }
};
