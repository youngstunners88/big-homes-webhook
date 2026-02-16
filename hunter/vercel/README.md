# Big Homes Webhook - Vercel Deployment

## Quick Deploy

```bash
cd /home/teacherchris37/.openclaw/workspace/big-homes/hunter/vercel

# Deploy to Vercel
vercel --prod --yes
```

## Your Webhook URL

After deployment, your webhook will be at:
```
https://[your-project].vercel.app/api/retell/webhook
```

## Configure in Retell Dashboard

Go to: https://dashboard.retellai.com

Set webhook URL:
```
https://[your-vercel-url]/api/retell/webhook
```

## Environment Variables

In Vercel dashboard, set:
- `RETELL_API_KEY` = key_006f8e2707bfeb9ef4c1a61d8d00
- `N8N_WEBHOOK_URL` = your n8n webhook (optional)

## Test

```bash
curl -X POST https://[your-url]/api/retell/webhook \
  -H "Content-Type: application/json" \
  -d '{"call_status": "test"}'
```

## Files

- `/api/webhook.js` - Main webhook handler
- `/vercel.json` - Vercel config
