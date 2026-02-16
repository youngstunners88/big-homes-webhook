#!/usr/bin/env node
/**
 * Big Homes - Data Capture System
 * Logs all calls to Google Sheets with complete audit data
 */

const fs = require('fs');
const path = require('path');

const CONFIG = {
  outputDir: path.join(__dirname, '../data')
};

// Call log structure
const CALL_LOG_SCHEMA = {
  timestamp: '',           // ISO timestamp
  business_name: '',       // Business Name
  contact_name: '',        // Contact Name
  phone: '',              // Phone number
  industry: '',           // Industry
  city: '',               // City
  call_duration: 0,       // Duration in seconds
  outcome: '',            // Answered/Voicemail/No Answer/Callback
  lead_temperature: '',   // HOT/WARM/COLD
  pain_points: [],        // Array of pain points
  estimated_missed_revenue: 0, // Calculated
  next_action: '',       // Scheduled Demo/Send Email/Call Back/Disqualify
  agent_notes: '',        // Transcript summary
  call_id: ''             // Retell call ID
};

/**
 * Calculate estimated missed revenue
 */
function calculateMissedRevenue(painPoints, industry) {
  const industryMultiplier = {
    plumber: 150,
    hvac: 200,
    electrician: 175,
    roofer: 250,
    contractor: 300,
    default: 150
  };
  
  const base = industryMultiplier[industry?.toLowerCase()] || industryMultiplier.default;
  
  // Adjust based on pain points
  if (painPoints.includes('missed_calls')) return base * 10;
  if (painPoints.includes('no_online_booking')) return base * 5;
  if (painPoints.includes('voicemail')) return base * 8;
  
  return base * 3;
}

/**
 * Save call log
 */
function saveCallLog(callData) {
  // Ensure directory exists
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }

  // Calculate missed revenue
  callData.estimated_missed_revenue = calculateMissedRevenue(
    callData.pain_points,
    callData.industry
  );

  // Add timestamp
  callData.timestamp = new Date().toISOString();

  // Load existing logs
  const logFile = path.join(CONFIG.outputDir, 'call-logs.json');
  let logs = [];
  
  if (fs.existsSync(logFile)) {
    try {
      logs = JSON.parse(fs.readFileSync(logFile));
    } catch (e) {
      logs = [];
    }
  }

  // Add new log
  logs.push(callData);

  // Save
  fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
  
  console.log(`✅ Call log saved: ${callData.business_name}`);
  console.log(`   Temperature: ${callData.lead_temperature}`);
  console.log(`   Est. missed revenue: $${callData.estimated_missed_revenue}/mo`);
  
  return callData;
}

/**
 * Export to CSV
 */
function exportToCSV() {
  const logFile = path.join(CONFIG.outputDir, 'call-logs.json');
  
  if (!fs.existsSync(logFile)) {
    console.log('❌ No call logs found');
    return;
  }

  const logs = JSON.parse(fs.readFileSync(logFile));
  
  const headers = [
    'Timestamp',
    'Business Name',
    'Contact Name',
    'Phone',
    'Industry',
    'City',
    'Call Duration (sec)',
    'Outcome',
    'Lead Temperature',
    'Pain Points',
    'Est. Missed Revenue',
    'Next Action',
    'Agent Notes',
    'Call ID'
  ];

  const rows = logs.map(log => [
    log.timestamp,
    log.business_name,
    log.contact_name,
    log.phone,
    log.industry,
    log.city,
    log.call_duration,
    log.outcome,
    log.lead_temperature,
    log.pain_points?.join('; ') || '',
    log.estimated_missed_revenue,
    log.next_action,
    log.agent_notes?.replace(/"/g, '""') || '',
    log.call_id
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
  
  const csvFile = path.join(CONFIG.outputDir, 'call-logs.csv');
  fs.writeFileSync(csvFile, csv);
  
  console.log(`✅ Exported ${logs.length} calls to ${csvFile}`);
}

/**
 * Get daily summary
 */
function getDailySummary() {
  const logFile = path.join(CONFIG.outputDir, 'call-logs.json');
  
  if (!fs.existsSync(logFile)) {
    console.log('❌ No call logs found');
    return;
  }

  const logs = JSON.parse(fs.readFileSync(logFile));
  const today = new Date().toISOString().split('T')[0];
  
  const todayLogs = logs.filter(l => l.timestamp.startsWith(today));
  
  const answered = todayLogs.filter(l => l.outcome === 'Answered').length;
  const voicemails = todayLogs.filter(l => l.outcome === 'Voicemail').length;
  const noAnswer = todayLogs.filter(l => l.outcome === 'No Answer').length;
  
  const demosBooked = todayLogs.filter(l => l.next_action === 'Scheduled Demo').length;
  const hotLeads = todayLogs.filter(l => l.lead_temperature === 'HOT').length;
  
  const totalMissed = todayLogs.reduce((sum, l) => sum + (l.estimated_missed_revenue || 0), 0);

  console.log(`
📊 Daily Summary - ${today}
============================
📞 Total Calls: ${todayLogs.length}
   ✅ Answered: ${answered}
   📩 Voicemails: ${voicemails}
   ❌ No Answer: ${noAnswer}

🎯 Results:
   📅 Demos Booked: ${demosBooked}
   🔥 HOT Leads: ${hotLeads}

💰 Pipeline:
   Est. Missed Revenue: $${totalMissed.toLocaleString()}/mo
`);
}

/**
 * Main
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args[0] === '--log') {
    // Example: node data-capture.js --log business.json
    const inputFile = args[1];
    if (!inputFile) {
      console.log('Usage: node data-capture.js --log <call-data.json>');
      return;
    }
    const callData = JSON.parse(fs.readFileSync(inputFile));
    saveCallLog(callData);
    return;
  }

  if (args[0] === '--export') {
    exportToCSV();
    return;
  }

  if (args[0] === '--summary') {
    getDailySummary();
    return;
  }

  // Demo log
  const demoCall = {
    business_name: 'Pro Plumbing Services',
    contact_name: 'John',
    phone: '(720) 555-0101',
    industry: 'plumber',
    city: 'Denver',
    call_duration: 180,
    outcome: 'Answered',
    lead_temperature: 'HOT',
    pain_points: ['missed_calls', 'no_online_booking'],
    next_action: 'Scheduled Demo',
    agent_notes: 'Interested in demo. Scheduled for Tuesday 2pm.',
    call_id: 'call_demo123'
  };
  
  saveCallLog(demoCall);
  getDailySummary();
}

main();
