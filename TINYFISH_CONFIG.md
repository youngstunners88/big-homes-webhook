# Big Homes - TinyFish Integration

## API Key
TINYFISH_API_KEY=sk-tinyfish-FPmyIWwTKwJNF8SbDG7Ynpw4kMtbVXZd

## Commands

### Find plumbers
```bash
curl -N -X POST "https://agent.tinyfish.ai/v1/automation/run-sse" \
  -H "X-API-Key: $TINYFISH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.google.com/maps/search/plumbers+in+new+york",
    "goal": "Find 10 plumbers, their phone numbers, and whether they have a website"
  }'
```

### Find HVAC
```bash
curl -N -X POST "https://agent.tinyfish.ai/v1/automation/run-sse" \
  -H "X-API-Key: $TINYFISH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.google.com/maps/search/HVAC+in+new+york",
    "goal": "Find 10 HVAC companies, phone numbers"
  }'
```

## Leads Found

### Batch 1 (Original)
- Joe's Plumbing
- Quick Fix Plumbing
- A-1 Emergency
- Elite Rooter
- Pro Drain
- Neighborhood Plumbing
- ABC Plumbing
- Reliable Plumber
- City Line Plumbing
- Top Tier Plumbing

### Batch 2 (TinyFish)
- Plumbing NYC: (646) 580-7524
- NYC Plumbing Services: (718) 804-5781
- Rite Plumbing: (347) 502-6441
- A&E NYC Plumbing: (646) 392-7164
- LZ Manhattan Plumbing: (315) 526-8735
