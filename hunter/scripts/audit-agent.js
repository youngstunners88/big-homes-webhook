#!/usr/bin/env node
/**
 * Big Homes - Audit Voice Agent
 * Configures Retell AI with custom knowledge base for cold outreach
 * 
 * Usage: node audit-agent.js --create
 */

const API_KEY = 'key_006f8e2707bfeb9ef4c1a61d8d00';
const BASE_URL = 'https://api.retellai.com/v2';

// Company Context
const COMPANY_CONTEXT = `
Big Homes helps service businesses save time and capture more customers through AI receptionists and automation.
We specialize in plumbing, HVAC, and construction industries.
We offer: AI phone agents (inbound/outbound), automated email follow-up, appointment scheduling, website building.
`;

// Target Pain Points
const PAIN_POINTS = `
1. Missed calls during jobs/lunch/after hours = lost revenue
2. Spending evenings calling back missed leads = work-life balance issues
3. No-shows wasting time = scheduling inefficiency
4. Relying on voicemail = 80% of callers hang up
5. Manual email follow-up = leads go cold
6. No online booking = friction for customers
7. Website outdated/missing = credibility issues
`;

// Call Script
const CALL_SCRIPT = `
OPENING: "Hi [Name], this is [Agent] from Big Homes. We're helping [Industry] businesses in [City] save 10+ hours weekly on phone calls. Do you have 60 seconds for a quick audit of how you're currently handling missed calls?"

DISCOVERY: "How many calls do you think you miss in a typical day? What happens when you're on a job and the phone rings? How do you handle after-hours calls?"

PAIN AMPLIFICATION: "So if I'm hearing right, you're losing [X] potential jobs weekly just from missed calls. At your average job value, that's potentially $[X] monthly walking to competitors."

VALUE BRIDGE: "We build AI receptionists that answer 24/7, book appointments while you work, and follow up via email automatically. One of our plumbing clients in [Nearby City] captured 30% more leads in month one."

CLOSE: "I'd love to show you a 5-minute demo of how this would sound for your business. Are you free Tuesday or Thursday for a brief call?"
`;

// System Prompt for Audit Agent
const SYSTEM_PROMPT = `You are a Big Homes audit agent conducting cold outreach calls to service businesses.

${COMPANY_CONTEXT}

TARGET PAIN POINTS:
${PAIN_POINTS}

CALL SCRIPT:
${CALL_SCRIPT}

IMPORTANT RULES:
1. Start with the opening script
2. Ask discovery questions to understand their current situation
3. Identify pain points and amplify them gently
4. Build value with case studies
5. Always try to book a demo call
6. If not interested, ask for referral
7. Thank them for their time either way

RESPONSE STYLE:
- Keep responses under 30 words when possible
- Sound professional but friendly
- Never be pushy
- Ask one question at a time

ESCALATION:
- If they say yes to demo → Collect: name, email, best time, calendar link
- If not interested → Ask: "Do you know any other [industry] businesses who might benefit?"
- If busy → "When's a better time to call back?"
`;

/**
 * Create audit agent
 */
async function createAuditAgent() {
  const response = await fetch(`${BASE_URL}/create-agent`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'Big Homes - Audit Agent',
      model: {
        provider: 'openai',
        model: 'gpt-4o-mini',
        system_prompt: SYSTEM_PROMPT
      },
      voice: {
        provider: 'elevenlabs',
        voice_id: 'rachel'
      },
      llm_options: {
        temperature: 0.7
      }
    })
  });

  const data = await response.json();
  return data;
}

/**
 * Update existing agent with knowledge base
 */
async function updateAgent(agentId) {
  const response = await fetch(`${BASE_URL}/update-agent/${agentId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: {
        provider: 'openai',
        model: 'gpt-4o-mini',
        system_prompt: SYSTEM_PROMPT
      }
    })
  });

  const data = await response.json();
  return data;
}

/**
 * Make outbound audit call
 */
async function makeAuditCall(toNumber, leadData) {
  const response = await fetch(`${BASE_URL}/create-phone-call`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from_number: '+14784198881',
      to_number: toNumber,
      retell_llm_dynamic_variables: {
        business_name: leadData.name || '',
        industry: leadData.industry || 'service',
        city: leadData.city || '',
        pain_point: leadData.pain_points?.[0] || ''
      }
    })
  });

  const data = await response.json();
  return data;
}

/**
 * Main
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args[0] === '--create') {
    console.log('🎙️ Creating Big Homes Audit Agent...\n');
    const agent = await createAuditAgent();
    console.log('✅ Agent created!');
    console.log(`   Agent ID: ${agent.agent_id}`);
    console.log(`   Name: ${agent.name}`);
    return agent;
  }
  
  if (args[0] === '--call' && args[1]) {
    console.log(`📞 Making audit call to ${args[1]}...\n`);
    const lead = {
      name: 'Test Business',
      industry: 'plumbing',
      city: 'Denver'
    };
    const call = await makeAuditCall(args[1], lead);
    console.log('✅ Call initiated!');
    console.log(`   Call ID: ${call.call_id}`);
    console.log(`   Status: ${call.call_status}`);
    return call;
  }

  console.log(`
🎯 Big Homes - Audit Voice Agent

Usage:
  node audit-agent.js --create    Create the audit agent
  node audit-agent.js --call +1234567890  Make a test call
`);
}

main().catch(console.error);
