export default async function handler(req, res) {
  // Construct the target URL
  // The frontend calls /api/admin/sectors/..., we want to forward to https://rwanda-administrative-api.onrender.com/api/sectors/...
  const targetPath = req.url.replace('/api/admin', '');
  const targetUrl = `https://rwanda-administrative-api.onrender.com/api${targetPath}`;

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    // Set CORS headers for the proxy itself
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy Error:', error);
    return res.status(500).json({ error: 'Failed to fetch from administrative API' });
  }
}
