// Big Homes Webhook - Vercel Serverless
// 1. Create Vercel project
// 2. Add this file as api/webhook.js
// 3. Set env: RETELL_API_KEY = key_006f8e2707bfeb9ef4c1a61d8d00
// 4. Deploy!

const API_KEY = process.env.RETELL_API_KEY || 'key_006f8e2707bfeb9ef4c1a61d8d00';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.url === '/health' || req.url === '/api/health') {
    return res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  }

  if (req.url === '/api/retell/webhook' && req.method === 'POST') {
    try {
      const event = req.body;
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

        console.log('✅ Logged:', callLog);

        if (process.env.N8N_WEBHOOK_URL) {
          await fetch(process.env.N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(callLog)
          });
        }
      }
      return res.status(200).json({ status: 'ok' });
    } catch (e) {
      console.error('❌', e);
      return res.status(500).json({ error: e.message });
    }
  }
  return res.status(404).json({ error: 'Not found' });
}
