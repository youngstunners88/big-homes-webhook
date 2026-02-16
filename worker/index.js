// Big Homes Webhook - Cloudflare Worker
// Deploy via: wrangler deploy

const RETELL_API_KEY = 'key_006f8e2707bfeb9ef4c1a61d8d00';

export default {
  async fetch(request, env) {
    // CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }

    const url = new URL(request.url);

    // Health check
    if (url.pathname === '/health') {
      return Response.json({ status: 'ok', timestamp: new Date().toISOString() });
    }

    // Retell webhook
    if (url.pathname === '/retell/webhook' && request.method === 'POST') {
      try {
        const event = await request.json();
        console.log('📡 Webhook:', event.call_status);

        if (event.call_status === 'ended') {
          const analysis = event.call_analysis || {};
          const summary = analysis.call_summary || '';
          
          let outcome = 'Unknown';
          if (event.disconnection_reason === 'user_hangup') outcome = 'Answered';
          else if (summary.toLowerCase().includes('voicemail')) outcome = 'Voicemail';

          let temperature = 'COLD';
          const lower = summary.toLowerCase();
          if (lower.includes('interested') || lower.includes('demo')) temperature = 'HOT';
          else if (lower.includes('curious')) temperature = 'WARM';

          const callLog = {
            timestamp: new Date().toISOString(),
            call_id: event.call_id,
            duration_ms: event.duration_ms,
            outcome,
            temperature,
            summary,
            sentiment: analysis.user_sentiment
          };

          console.log('✅ Logged:', JSON.stringify(callLog));

          // Forward to n8n if configured
          if (env.N8N_WEBHOOK_URL) {
            await fetch(env.N8N_WEBHOOK_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(callLog)
            });
          }
        }

        return Response.json({ status: 'ok' });
      } catch (e) {
        console.error('❌ Error:', e);
        return Response.json({ error: e.message }, { status: 500 });
      }
    }

    return Response.json({ error: 'Not found' }, { status: 404 });
  }
};
