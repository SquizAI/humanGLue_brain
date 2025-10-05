#!/usr/bin/env node

import { config } from 'dotenv';
import { parseArgs } from 'util';

config();

const VAPI_API_KEY = process.env.VAPI_API_KEY;

if (!VAPI_API_KEY) {
  console.error('❌ VAPI_API_KEY environment variable is required');
  process.exit(1);
}

// Parse command line arguments
const { values } = parseArgs({
  options: {
    phone: {
      type: 'string',
      short: 'p',
      description: 'Phone number to call (required)'
    },
    name: {
      type: 'string',
      short: 'n',
      default: 'Educator',
      description: 'Name of the person to call'
    },
    institution: {
      type: 'string',
      short: 'i',
      default: 'your institution',
      description: 'Name of the educational institution'
    },
    phoneNumberId: {
      type: 'string',
      default: 'd4269d03-3914-404a-a798-aa58570abfb1',
      description: 'Vapi phone number ID to use (Education: +14482286664)'
    },
    help: {
      type: 'boolean',
      short: 'h',
      description: 'Show help'
    }
  }
});

if (values.help || !values.phone) {
  console.log(`
Educational AI Assessment Call Script

Usage: npm run education-assessment -- --phone <number> [options]

Options:
  -p, --phone <number>        Phone number to call (required)
  -n, --name <name>          Name of the person (default: "Educator")
  -i, --institution <name>   Institution name (default: "your institution")
  --phoneNumberId <id>       Vapi phone number ID (default: current)
  -h, --help                Show help

Example:
  npm run education-assessment -- --phone +1234567890 --name "Dr. Smith" --institution "Lincoln High School"
  `);
  process.exit(0);
}

const ASSISTANT_ID = '0fda58ce-6ad6-464d-995b-4bf57bdda974'; // Education AI Assessment

async function makeEducationAssessmentCall() {
  try {
    console.log('🎓 HumanGlue Education AI Assessment System');
    console.log('==========================================');
    console.log(`📞 Calling: ${values.phone}`);
    console.log(`👤 Contact: ${values.name}`);
    console.log(`🏫 Institution: ${values.institution}`);
    console.log(`🤖 Assistant: HumanGlue Education AI Assessment`);
    console.log('');
    
    const response = await fetch('https://api.vapi.ai/call', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        assistantId: ASSISTANT_ID,
        customer: {
          number: values.phone,
        },
        phoneNumberId: values.phoneNumberId,
        assistantOverrides: {
          variableValues: {
            contactName: values.name,
            institutionName: values.institution,
          }
        }
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API call failed: ${error}`);
    }

    const data = await response.json();
    
    console.log('✅ Education assessment call initiated successfully!');
    console.log('');
    console.log('Call Details:');
    console.log(`- Call ID: ${data.id}`);
    console.log(`- Status: ${data.status}`);
    console.log(`- Duration: ~20 minutes expected`);
    console.log('');
    console.log('The AI assistant will assess:');
    console.log('📊 Technology Infrastructure & Readiness');
    console.log('🎯 Teaching & Learning Innovation');
    console.log('⚡ Administrative Efficiency');
    console.log('👥 Stakeholder Engagement');
    console.log('🚀 AI Adoption & Innovation');
    console.log('');
    console.log('After the call, you will receive:');
    console.log('- Current AI Maturity Level (0-10)');
    console.log('- Key opportunities for improvement');
    console.log('- Customized transformation roadmap');
    console.log('- ROI projections');
    
    return data;
  } catch (error) {
    console.error('❌ Error making education assessment call:', error);
    throw error;
  }
}

// Execute the call
makeEducationAssessmentCall()
  .then(() => {
    console.log('\n✨ Education assessment call scheduled successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed to schedule education assessment call');
    process.exit(1);
  });