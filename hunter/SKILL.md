---
name: big-homes-hunter
description: |
  Lead generation swarm for construction/real estate service businesses.
  Use when: Finding plumbers, HVAC, electricians, contractors without websites.
  Use when: Building lead list for outreach campaigns.
  Do NOT use: For non-service businesses or existing customers.
---

# Big Homes - Hunter Agent System

## Overview
Automated lead generation for construction/real estate service businesses.

## Target Industries
- Plumbers
- HVAC
- Electricians
- Roofing
- General Contractors
- Landscapers
- Painters
- Handymen

## Lead Temperature Scoring

| Score | Criteria |
|-------|----------|
| 🔥 HOT | No website + (24/7 OR multiple locations OR 20+ reviews) |
| 🌡️ WARM | Has website but outdated, or 10-20 reviews |
| ❄️ COLD | Has basic website, no automation |

## Quick Start

```bash
# 1. Run the scout to find leads
cd /home/teacherchris37/.openclaw/workspace/big-homes/hunter
node scripts/scout.js

# 2. Export to Google Sheets (or CSV)
node scripts/export-sheets.js
```

## Output Format

```json
{
  "name": "Pro Plumbing Services",
  "phone": "(720) 555-0101",
  "address": "123 Main St, Denver CO",
  "industry": "plumber",
  "has_website": false,
  "reviews_count": 45,
  "temperature": "HOT",
  "score": 8,
  "pain_points": ["no_website", "missing_calls"],
  "pitch_angle": "Get found on Google + Never miss a booking"
}
```

## Configuration

### SerpAPI (for Google Maps)
1. Get key from https://serpapi.com/
2. Set: `export SERPAPI_KEY=your_key`

### Google Sheets (optional)
1. Create Google Cloud project
2. Enable Google Sheets API
3. Download service account credentials
4. Set: `export GOOGLE_CREDS=./credentials.json`
5. Share sheet with service account email

## Files
- `/hunter/scripts/scout.js` - Main scraper
- `/hunter/scripts/export-sheets.js` - Export to Sheets/CSV
- `/hunter/data/` - Lead output files

## Usage in ANTFARM

```bash
antfarm workflow run hunter-scout "Plumbers in Denver Colorado"
```
