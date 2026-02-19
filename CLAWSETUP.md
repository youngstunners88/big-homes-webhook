# ClawWork Setup for Big Homes

## What's Needed

To run ClawWork and test our $100/day ideas, we need:

### Required API Keys

| Key | Where to Get | Cost |
|-----|--------------|------|
| **OpenAI API** | https://platform.openai.com | $10-50 |
| **Tavily Search** | https://tavily.com (free tier) | Free |

### Or Use Existing

We can try using our current OpenRouter setup if compatible.

---

## Current Status

- ✅ ClawWork cloned
- ✅ Dependencies installed  
- ❌ Need API keys to run

---

## What We'd Test

Once running, we'd test:

1. **Plumbing Lead Gen** - Can AI call 10 plumbers?
2. **Crypto Signals** - Can AI find profitable trades?
3. **Contra Freelancing** - Can AI bid and complete jobs?

The system tracks:
- Money earned
- Token costs
- Net profit
- Survival (can the AI keep going?)

---

## Alternative: Run Locally

You can run on your machine:

```bash
git clone https://github.com/HKUDS/ClawWork.git
cd ClawWork

# Add your API keys to .env
cp .env.example .env
nano .env  # Fill in keys

# Run
./start_dashboard.sh
```

This will show you the live dashboard of AI making money.

---

## The Insight

ClawWork PROVES AI can earn money. We just need to:

1. Figure out WHAT to have AI do (our job ideas)
2. Let AI execute (ClawWork-style)

**Our ideas to test:**
- Crypto signals ✅
- Freelance on Contra ✅
- Lead gen for plumbers ✅

Want me to continue setting this up, or do you want to run locally with your own API keys?
