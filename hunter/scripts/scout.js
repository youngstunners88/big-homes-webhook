#!/usr/bin/env node
/**
 * Hunter Lead Scout - Google Maps Scraper
 * Uses SerpAPI to find local businesses
 * 
 * Setup: Get API key from https://serpapi.com/
 * Install: npm install google-search-results
 */

const fs = require('fs');

// Configuration
const CONFIG = {
  apiKey: process.env.SERPAPI_KEY || '', // Set your SerpAPI key
  outputDir: './data'
};

// Industries to target
const INDUSTRIES = [
  'plumbers',
  'hvac',
  'electricians',
  'roofing contractors',
  'general contractors',
  'landscaping',
  'painting',
  'handyman'
];

// Sample cities to target
const CITIES = [
  { name: 'Denver', state: 'CO' },
  { name: 'Austin', state: 'TX' },
  { name: 'Phoenix', state: 'AZ' },
  { name: 'Las Vegas', state: 'NV' },
  { name: 'Miami', state: 'FL' }
];

/**
 * Search Google Maps for businesses
 */
async function searchMaps(query) {
  if (!CONFIG.apiKey) {
    console.log('⚠️ No SerpAPI key - using demo data');
    return getDemoData(query);
  }

  const { GoogleSearch } = require('google-search-results');
  const search = new GoogleSearch(CONFIG.apiKey);

  return new Promise((resolve, reject) => {
    search.json({
      q: query,
      location: 'United States',
      num: 20,
      gl: 'us'
    }, (data) => {
      if (data.organic_results) {
        resolve(parseResults(data.organic_results));
      } else {
        resolve([]);
      }
    });
  });
}

/**
 * Parse SerpAPI results
 */
function parseResults(results) {
  return results.map(item => ({
    name: item.title || '',
    phone: item.phone || '',
    address: item.address || '',
    has_website: !!item.website,
    reviews_count: item.reviews_count || 0,
    rating: item.rating || 0,
    source: 'google_maps'
  })).filter(item => item.name);
}

/**
 * Demo data when no API key
 */
function getDemoData(query) {
  const industry = query.toLowerCase().split(' ')[0];
  const businesses = [
    { name: 'Pro Plumbing Services', phone: '(720) 555-0101', has_website: false, reviews_count: 45 },
    { name: 'Quick Fix HVAC', phone: '(303) 555-0102', has_website: false, reviews_count: 23 },
    { name: 'Elite Electric Co', phone: '(720) 555-0103', has_website: true, reviews_count: 67 },
    { name: 'Denver Roofing Pro', phone: '(303) 555-0104', has_website: false, reviews_count: 12 },
    { name: 'City Handyman Services', phone: '(720) 555-0105', has_website: false, reviews_count: 8 },
    { name: 'A+ Landscaping', phone: '(303) 555-0106', has_website: true, reviews_count: 34 },
    { name: 'Bob\'s Painters', phone: '(720) 555-0107', has_website: false, reviews_count: 19 },
    { name: 'Master Contractors LLC', phone: '(303) 555-0108', has_website: false, reviews_count: 52 }
  ];
  
  return businesses.map(b => ({
    ...b,
    address: '123 Main St, Denver CO',
    industry: industry,
    rating: 4.0
  }));
}

/**
 * Score leads based on temperature
 */
function scoreLead(lead) {
  let score = 0;
  const painPoints = [];
  const pitchAngles = [];

  // No website = HOT
  if (!lead.has_website) {
    score += 5;
    painPoints.push('no_website');
    pitchAngles.push('Get found on Google');
  }

  // High reviews = HOT
  if (lead.reviews_count > 20) {
    score += 3;
    painPoints.push('missing_calls');
    pitchAngles.push('Never miss a booking');
  }

  // Has website but basic = WARM
  if (lead.has_website && !lead.has_online_booking) {
    score += 2;
    painPoints.push('no_online_booking');
    pitchAngles.push('Add online booking');
  }

  // Temperature
  let temperature = 'COLD';
  if (score >= 7) temperature = 'HOT';
  else if (score >= 4) temperature = 'WARM';

  return {
    ...lead,
    score,
    temperature,
    pain_points: painPoints,
    pitch_angle: pitchAngles.join(' + ')
  };
}

/**
 * Main execution
 */
async function main() {
  console.log('🎯 Big Homes - Hunter Lead Scout');
  console.log('================================\n');

  const allLeads = [];

  for (const city of CITIES) {
    for (const industry of INDUSTRIES.slice(0, 2)) { // Limit to 2 for demo
      const query = `${industry} in ${city.name} ${city.state}`;
      console.log(`📡 Searching: ${query}`);
      
      const leads = await searchMaps(query);
      const scored = leads.map(lead => ({
        ...lead,
        city: city.name,
        industry,
        ...scoreLead(lead)
      }));
      
      allLeads.push(...scored);
      console.log(`   Found ${scored.length} leads`);
    }
  }

  // Save to JSON
  const outputFile = `${CONFIG.outputDir}/leads-${Date.now()}.json`;
  fs.writeFileSync(outputFile, JSON.stringify(allLeads, null, 2));
  console.log(`\n✅ Saved ${allLeads.length} leads to ${outputFile}`);

  // Summary
  const hot = allLeads.filter(l => l.temperature === 'HOT').length;
  const warm = allLeads.filter(l => l.temperature === 'WARM').length;
  const cold = allLeads.filter(l => l.temperature === 'COLD').length;

  console.log('\n📊 Lead Summary:');
  console.log(`   🔥 HOT:  ${hot}`);
  console.log(`   🌡️ WARM: ${warm}`);
  console.log(`   ❄️ COLD: ${cold}`);

  return allLeads;
}

main().catch(console.error);
