// Mind Reasoner Simulation Proxy
// This function proxies requests to the Mind Reasoner API

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { mindId, message, model = 'mind-reasoner-pro' } = JSON.parse(event.body);

    if (!mindId || !message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'mindId and message are required' })
      };
    }

    const apiKey = process.env.MINDREASONER_API_KEY;
    if (!apiKey) {
      console.error('MINDREASONER_API_KEY not configured');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Mind Reasoner API not configured' })
      };
    }

    // Call Mind Reasoner API
    const response = await fetch('https://app.mindreasoner.com/api/public/v1/simulate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mindId,
        scenario: { message },
        selectedSimulationModel: model
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Mind Reasoner API error:', response.status, errorText);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          error: 'Mind Reasoner API error',
          details: errorText
        })
      };
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error('Simulation error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
