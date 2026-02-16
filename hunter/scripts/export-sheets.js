#!/usr/bin/env node
/**
 * Hunter - Google Sheets Exporter
 * Exports scored leads to Google Sheets
 * 
 * Setup:
 * 1. Go to https://console.cloud.google.com/
 * 2. Create project and enable Google Sheets API
 * 3. Create service account and download credentials.json
 * 4. Share your sheet with the service account email
 */

const fs = require('fs');
const path = require('path');

// Try to load Google APIs
let GoogleSpreadsheet;
try {
  GoogleSpreadsheet = require('google-spreadsheet');
} catch (e) {
  console.log('⚠️ google-spreadsheet not installed');
  console.log('   Install: npm install google-spreadsheet');
}

// Configuration
const CONFIG = {
  credsPath: process.env.GOOGLE_CREDS || './credentials.json',
  sheetId: process.env.GOOGLE_SHEET_ID || ''
};

/**
 * Export leads to Google Sheets
 */
async function exportToSheets(leads) {
  if (!GoogleSpreadsheet) {
    console.log('⚠️ Google Sheets not configured');
    console.log('   Exporting to CSV instead...\n');
    return exportToCSV(leads);
  }

  const { JWT } = require('google-auth-library');
  const doc = new GoogleSpreadsheet(CONFIG.sheetId);

  // Authenticate
  const creds = JSON.parse(fs.readFileSync(CONFIG.credsPath));
  await doc.useServiceAccountAuth(creds);

  // Get or create sheet
  await doc.loadInfo();
  let sheet = doc.sheetsByIndex[0];
  
  if (!sheet) {
    sheet = await doc.addSheet({ title: 'Hunter Leads' });
  }

  // Headers
  const headers = [
    'Business Name',
    'Phone',
    'Address',
    'Industry',
    'Website Status',
    'Lead Temperature',
    'Score',
    'Pain Points',
    'Pitch Angle',
    'City',
    'Last Updated'
  ];

  // Convert leads to rows
  const rows = leads.map(lead => ({
    'Business Name': lead.name,
    'Phone': lead.phone,
    'Address': lead.address || '',
    'Industry': lead.industry,
    'Website Status': lead.has_website ? 'Has Website' : 'None',
    'Lead Temperature': lead.temperature,
    'Score': lead.score,
    'Pain Points': lead.pain_points?.join(', ') || '',
    'Pitch Angle': lead.pitch_angle || '',
    'City': lead.city || '',
    'Last Updated': new Date().toISOString()
  }));

  // Clear and add rows
  await sheet.clear();
  await sheet.setHeaderRow(headers);
  await sheet.addRows(rows);

  console.log(`✅ Exported ${rows.length} leads to Google Sheets`);
}

/**
 * Export to CSV (fallback)
 */
function exportToCSV(leads) {
  const outputDir = path.join(__dirname, '../data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputFile = path.join(outputDir, `leads-${Date.now()}.csv`);
  
  const headers = [
    'Business Name',
    'Phone',
    'Address',
    'Industry',
    'Website Status',
    'Lead Temperature',
    'Score',
    'Pain Points',
    'Pitch Angle',
    'City',
    'Last Updated'
  ];

  const rows = leads.map(lead => [
    lead.name || '',
    lead.phone || '',
    lead.address || '',
    lead.industry || '',
    lead.has_website ? 'Has Website' : 'None',
    lead.temperature || '',
    lead.score || 0,
    lead.pain_points?.join('; ') || '',
    lead.pitch_angle || '',
    lead.city || '',
    new Date().toISOString()
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
  
  fs.writeFileSync(outputFile, csv);
  console.log(`✅ Exported ${leads.length} leads to ${outputFile}`);
}

/**
 * Main
 */
async function main() {
  const inputFile = process.argv[2] || path.join(__dirname, '../data/leads-latest.json');
  
  if (!fs.existsSync(inputFile)) {
    console.log('❌ No leads file found');
    console.log('   Run: node scout.js first');
    process.exit(1);
  }

  const leads = JSON.parse(fs.readFileSync(inputFile));
  
  console.log('🎯 Big Homes - Hunter Lead Export');
  console.log('===================================\n');
  console.log(`📂 Loading ${leads.length} leads from ${inputFile}\n`);

  await exportToSheets(leads);

  console.log('\n📊 Lead Summary:');
  const hot = leads.filter(l => l.temperature === 'HOT').length;
  const warm = leads.filter(l => l.temperature === 'WARM').length;
  const cold = leads.filter(l => l.temperature === 'COLD').length;
  console.log(`   🔥 HOT:  ${hot}`);
  console.log(`   🌡️ WARM: ${warm}`);
  console.log(`   ❄️ COLD: ${cold}`);
}

main().catch(console.error);
