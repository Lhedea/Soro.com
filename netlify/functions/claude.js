// Netlify Function
// Keeps the Anthropic API key on the server. Set ANTHROPIC_API_KEY in
// Site settings -> Environment variables in the Netlify dashboard.

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server is missing ANTHROPIC_API_KEY' }) };
  }

  try {
    const { prompt, maxTokens } = JSON.parse(event.body || '{}');
    if (!prompt || typeof prompt !== 'string') {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing "prompt" in request body' }) };
    }

    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: Math.min(Number(maxTokens) || 1000, 2000),
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await upstream.json();

    return {
      statusCode: upstream.status,
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error calling Claude API', detail: String(err) }),
    };
  }
};
