# Big Homes - n8n Workflow Templates

## Workflow 1: Call Logging to Google Sheets

```json
{
  "name": "Big Homes - Call Logger",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "call-webhook",
        "responseMode": "onReceived",
        "options": {}
      },
      "id": "webhook",
      "name": "Webhook - Call Events",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1
    },
    {
      "parameters": {
        "operation": "append",
        "sheetId": "{{$env.GOOGLE_SHEET_ID}}",
        "range": "A:N",
        "values": {
          "0": "{{$json.timestamp}}",
          "1": "{{$json.business_name}}",
          "2": "{{$json.contact_name}}",
          "3": "{{$json.phone}}",
          "4": "{{$json.industry}}",
          "5": "{{$json.city}}",
          "6": "{{$json.call_duration}}",
          "7": "{{$json.outcome}}",
          "8": "{{$json.lead_temperature}}",
          "9": "{{$json.pain_points}}",
          "10": "{{$json.estimated_missed_revenue}}",
          "11": "{{$json.next_action}}",
          "12": "{{$json.agent_notes}}",
          "13": "{{$json.call_id}}"
        }
      },
      "id": "sheets",
      "name": "Append to Google Sheets",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 3
    },
    {
      "parameters": {
        "chatId": "{{$env.TELEGRAM_CHAT_ID}}",
        "text": "📞 Call logged: {{$json.business_name}} - {{$json.outcome}}"
      },
      "id": "telegram",
      "name": "Notify Telegram",
      "type": "n8n-nodes-base.telegram",
      "typeVersion": 1
    }
  ],
  "connections": {
    "Webhook - Call Events": {
      "main": [[{"node": "Append to Google Sheets", "type": "main", "index": 0}]]
    },
    "Append to Google Sheets": {
      "main": [[{"node": "Notify Telegram", "type": "main", "index": 0}]]
    }
  }
}
```

## Workflow 2: Voicemail Follow-up Email

```json
{
  "name": "Big Homes - Voicemail Follow-up",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [{"field": "hours", "hoursInterval": 2}]
        }
      },
      "id": "schedule",
      "name": "Check every 2 hours",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1
    },
    {
      "parameters": {
        "operation": "lookup",
        "sheetId": "{{$env.GOOGLE_SHEET_ID}}",
        "range": "A:N",
        "key": "Outcome",
        "value": "Voicemail"
      },
      "id": "getVoicemails",
      "name": "Get Voicemail Calls",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 3
    },
    {
      "parameters": {
        "to": "{{$json.contact_email}}",
        "subject": "Sorry I missed you - {{$json.business_name}} audit results",
        "body": "Hi {{$json.contact_name}},\n\nI tried reaching you regarding your {{$json.industry}} business. Based on what I saw, you're likely missing {{$json.estimated_missed_revenue}} in monthly revenue from missed calls.\n\nI'd love to show you how our AI receptionist can help capture those lost leads. Would you have 5 minutes this week for a quick demo?\n\nBook a time here: {{$env.CALENDLY_LINK}}\n\nBest,\nBig Homes Team"
      },
      "id": "sendEmail",
      "name": "Send Follow-up Email",
      "type": "n8n-nodes-base.gmail",
      "typeVersion": 2
    }
  ],
  "connections": {
    "Check every 2 hours": {
      "main": [[{"node": "Get Voicemail Calls", "type": "main", "index": 0}]]
    },
    "Get Voicemail Calls": {
      "main": [[{"node": "Send Follow-up Email", "type": "main", "index": 0}]]
    }
  }
}
```

## Workflow 3: Nurture Sequence (48hr follow-up)

```json
{
  "name": "Big Homes - 48hr Nurture",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [{"field": "hours", "hoursInterval": 24}]
        }
      },
      "id": "daily",
      "name": "Daily Check",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1
    },
    {
      "parameters": {
        "operation": "lookup",
        "sheetId": "{{$env.GOOGLE_SHEET_ID}}",
        "range": "A:N",
        "key": "Next Action",
        "value": "Send Email"
      },
      "id": "getPending",
      "name": "Get Pending Emails",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 3
    },
    {
      "parameters": {
        "to": "{{$json.contact_email}}",
        "subject": "Following up - {{$json.industry}} automation",
        "body": "Hi {{$json.contact_name}},\n\nFollowing up on our conversation about automating your {{$json.industry}} business.\n\nMany of our clients were skeptical at first, but after seeing the results (30% more booked appointments in month one), they wished they'd started sooner.\n\nQuick question: What's the biggest challenge preventing you from getting started?\n\nBook a call: {{$env.CALENDLY_LINK}}\n\nBest,\nBig Homes"
      },
      "id": "sendNurture",
      "name": "Send Nurture Email",
      "type": "n8n-nodes-base.gmail",
      "typeVersion": 2
    }
  ]
}
```

## Workflow 4: HOT Lead Priority Alert

```json
{
  "name": "Big Homes - HOT Lead Alert",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "hot-lead",
        "responseMode": "onReceived"
      },
      "id": "webhook",
      "name": "Webhook - HOT Lead",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1
    },
    {
      "parameters": {
        "chatId": "{{$env.TELEGRAM_CHAT_ID}}",
        "text": "🔥 HOT LEAD ALERT!\n\n{{$json.business_name}}\n{{$json.contact_name}} - {{$json.phone}}\nPain Points: {{$json.pain_points}}\nEst. Value: ${{$json.estimated_missed_revenue}}/mo\n\n⏰ PRIORITY: Call within 2 hours!"
      },
      "id": "alert",
      "name": "Telegram Alert",
      "type": "n8n-nodes-base.telegram",
      "typeVersion": 1
    },
    {
      "parameters": {
        "to": "{{$env.SALES_EMAIL}}",
        "subject": "🔥 HOT LEAD: {{$json.business_name}}",
        "body": "New HOT lead requires immediate follow-up!\n\nBusiness: {{$json.business_name}}\nContact: {{$json.contact_name}}\nPhone: {{$json.phone}}\nPain Points: {{$json.pain_points}}\nEst. Monthly Value: ${{$json.estimated_missed_revenue}}"
      },
      "id": "emailAlert",
      "name": "Email Alert",
      "type": "n8n-nodes-base.gmail",
      "typeVersion": 2
    }
  ],
  "connections": {
    "Webhook - HOT Lead": {
      "main": [[{"node": "Telegram Alert", "type": "main", "index": 0}]]
    },
    "Telegram Alert": {
      "main": [[{"node": "Email Alert", "type": "main", "index": 0}]]
    }
  }
}
```

## Workflow 5: Daily Summary Report

```json
{
  "name": "Big Homes - Daily Summary",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "cronExpression": "0 18 * * *"
        }
      },
      "id": "schedule",
      "name": "Daily 6PM",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1
    },
    {
      "parameters": {
        "operation": "read",
        "sheetId": "{{$env.GOOGLE_SHEET_ID}}",
        "range": "A:N"
      },
      "id": "getData",
      "name": "Get Today's Data",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 3
    },
    {
      "parameters": {
        "to": "{{$env.SALES_EMAIL}}",
        "subject": "📊 Big Homes Daily Summary - {{$json.date}}",
        "body": "Daily Report:\n\n📞 Calls Made: {{$json.total_calls}}\n✅ Answered: {{$json.answered}}\n📩 Voicemails: {{$json.voicemails}}\n📅 Demos Booked: {{$json.demos_booked}}\n🔥 HOT Leads: {{$json.hot_leads}}\n\nPipeline Value: ${{$json.pipeline_value}}"
      },
      "id": "sendReport",
      "name": "Send Email Report",
      "type": "n8n-nodes-base.gmail",
      "typeVersion": 2
    }
  ]
}
```
