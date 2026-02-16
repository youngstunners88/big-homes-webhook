#!/usr/bin/env node
/**
 * Big Homes - Webhook Server
 * Handles Retell AI webhook events and forwards to n8n
 * 
 * Usage: node webhook-server.js
 * 
 * For production, deploy to: https://big-homes-webhook.vercel.app
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 18790;

// Configuration
const CONFIG = {
  n8nWebhookUrl: process.env.N8N_WEBHOOK_URL || '',
  telegramChatId: process.env.TELEGRAM_CHAT_ID || '',
  retellApiKey: process.env.RETELL_API_KEY || 'key_006f8e2707bfeb9ef4c1a61d8d00'
};

/**
 * Handle incoming webhook from Retell
 */
async function handleRetellWebhook(body) {
  console.log('📡 Received Retell webhook:', body);
  
  const event = body;
  
  switch (event.call_status) {
    case 'started':
      console.log('📞 Call started');
      break;
      
    case 'ended':
      console.log('📞 Call ended');
      await processCallEnded(event);
      break;
      
    case 'ongoing':
      // In-progress handling
      break;
      
    default:
      console.log('⚠️ Unknown event:', event.call_status);
  }
  
  // Forward to n8n if configured
  if (CONFIG.n8nWebhookUrl) {
    try {
      await fetch(CONFIG.n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
      console.log('✅ Forwarded to n8n');
    } catch (e) {
      console.log('❌ n8n forward failed:', e.message);
    }
  }
  
  return { status: 'ok' };
}

/**
 * Process ended call - log data
 */
async function processCallEnded(event) {
  // Extract call analysis
  const analysis = event.call_analysis || {};
  const summary = analysis.call_summary || '';
  const sentiment = analysis.user_sentiment || 'neutral';
  const successful = analysis.call_successful || false;
  
  // Determine outcome
  let outcome = 'Unknown';
  if (event.disconnection_reason === 'user_hangup') {
    outcome = 'Answered';
  } else if (summary.toLowerCase().includes('voicemail')) {
    outcome = 'Voicemail';
  }
  
  // Determine lead temperature
  let temperature = 'COLD';
  const lowerSummary = summary.toLowerCase();
  if (lowerSummary.includes('interested') || lowerSummary.includes('demo') || lowerSummary.includes('book')) {
    temperature = 'HOT';
  } else if (lowerSummary.includes('curious') || lowerSummary.includes('more info')) {
    temperature = 'WARM';
  }
  
  // Build call log
  const callLog = {
    timestamp: new Date().toISOString(),
    call_id: event.call_id,
    business_name: event.retell_llm_dynamic_variables?.business_name || 'Unknown',
    industry: event.retell_llm_dynamic_variables?.industry || 'service',
    city: event.retell_llm_dynamic_variables?.city || '',
    call_duration: event.duration_ms ? Math.round(event.duration_ms / 1000) : 0,
    outcome: outcome,
    lead_temperature: temperature,
    sentiment: sentiment,
    call_successful: successful,
    summary: summary
  };
  
  // Save locally
  const logFile = path.join(__dirname, '../data/call-logs.json');
  let logs = [];
  if (fs.existsSync(logFile)) {
    try { logs = JSON.parse(fs.readFileSync(logFile)); } catch (e) {}
  }
  logs.push(callLog);
  fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
  
  console.log('✅ Call logged:', callLog);
  
  // Send Telegram notification if HOT
  if (temperature === 'HOT' && CONFIG.telegramChatId) {
    await sendTelegramAlert(callLog);
  }
  
  return callLog;
}

/**
 * Send Telegram alert for HOT leads
 */
async function sendTelegramAlert(callLog) {
  const message = `🔥 HOT LEAD!

${callLog.business_name}
Industry: ${callLog.industry}
Sentiment: ${callLog.sentiment}
Duration: ${callLog.call_duration}s

Summary: ${callLog.summary.substring(0, 200)}`;

  console.log('📱 Would send Telegram:', message);
  // Telegram integration would go here
}

/**
 * Health check endpoint
 */
function healthCheck() {
  return { status: 'ok', timestamp: new Date().toISOString() };
}

/**
 * Main server
 */
const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Routes
  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(healthCheck()));
    return;
  }
  
  if (req.url === '/retell/webhook' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const result = await handleRetellWebhook(data);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (e) {
        console.error('❌ Webhook error:', e);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }
  
  // 404
  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`
🎯 Big Homes Webhook Server
============================
Server running on port ${PORT}
Endpoints:
  GET  /           - Health check
  POST /retell/webhook - Retell events
`);
});
