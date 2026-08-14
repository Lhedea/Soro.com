// Netlify Function
// Calls Google's Gemini API. Keeps the key on the server.
// Set GEMINI_API_KEY in Site configuration -> Environment variables.

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server is missing GEMINI_API_KEY' }) };
  }

  try {
    const { prompt, maxTokens } = JSON.parse(event.body || '{}');
    if (!prompt || typeof prompt !== 'string') {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing "prompt" in request body' }) };
    }

    const upstream = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: Math.min(Math.max(Number(maxTokens) || 1000, 300), 2000),
            thinkingConfig: { thinkingLevel: 'low' },
          },
        }),
      }
    );

    const data = await upstream.json();

    if (!upstream.ok) {
      return { statusCode: upstream.status, body: JSON.stringify(data) };
    }

    // Normalize Gemini's response into the { content: [{ type: 'text', text }] }
    // shape the frontend already expects, so index.html needs no changes.
    const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '';

    if (!text) {
      const finishReason = data?.candidates?.[0]?.finishReason || 'UNKNOWN';
      return {
        statusCode: 502,
        body: JSON.stringify({ error: 'Gemini returned no text', finishReason, raw: data }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ content: [{ type: 'text', text }] }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error calling Gemini API', detail: String(err) }),
    };
  }
};
