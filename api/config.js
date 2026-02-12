module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=300');

  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  const kakaoRestKey = process.env.KAKAO_REST_KEY || '';
  const redirectUri = process.env.KAKAO_REDIRECT_URI || '';

  return res.status(200).json({
    kakaoLogin: !!(kakaoRestKey && redirectUri),
    kakaoRestKey,
    redirectUri,
  });
};
