---
name: big-homes-hunter
description: |
  Big Homes AI agent system for cold outreach and lead generation.
  Use when: Making outbound calls to service businesses (plumbers, HVAC, electricians).
  Use when: Conducting audit calls to identify pain points.
  Do NOT use: For inbound customer service.
---

# Big Homes Hunter Skill

## Quick Start

```bash
# Make a test call
curl -X POST "https://api.retellai.com/v2/create-phone-call" \
  -H "Authorization: Bearer key_006f8e2707bfeb9ef4c1a61d8d00" \
  -H "Content-Type: application/json" \
  -d '{
    "from_number": "+14784198881",
    "to_number": "+1234567890",
    "retell_llm_dynamic_variables": {
      "company": "Big Homes",
      "industry": "plumbing",
      "value_prop": "Save 10+ hours weekly",
      "pain_point": "$3000+/month missed revenue",
      "cta": "Schedule demo"
    }
  }'
```

## Phone Numbers
- +14784198881
- +18452039188

## Variables to Pass
| Variable | Description |
|----------|-------------|
| company | Big Homes |
| industry | plumber, hvac, electrician, roofer, contractor |
| city | Target city |
| value_prop | Main value proposition |
| pain_point | Specific pain point for that industry |
| cta | Call to action |

## Call Script Framework

**Opening:**
"Hi [Name], this is [Agent] with Big Homes. Quick question - how does [Industry] typically handle missed calls?"

**Discovery:**
- How many calls miss weekly?
- What happens on jobs when phone rings?
- After-hours handling?

**Pain:**
- "At $150-200/job, that's $3,000+/month lost"

**Value:**
- "Our [industry] clients capture 30% more leads"

**Close:**
- HOT: "Schedule demo?"
- WARM: "Send info?"
- COLD: "Referral?"

## Latency Fix
- Deploy webhook to US-based Vercel (closest to Retell's servers)
- Use GPT-4o-mini (faster than GPT-4)
- Keep prompts under 500 words
