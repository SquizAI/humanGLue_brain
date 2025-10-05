#!/usr/bin/env node

require('dotenv').config();

const VAPI_API_KEY = process.env.VAPI_API_KEY;
const ASSISTANT_ID = '0fda58ce-6ad6-464d-995b-4bf57bdda974'; // Education AI Assessment
const PHONE_NUMBER_ID = 'd4269d03-3914-404a-a798-aa58570abfb1'; // Education phone: +14482286664

// Get phone number from command line or prompt
const phoneNumber = process.argv[2];

if (!phoneNumber) {
  console.log(`
🎓 HumanGlue Education AI Assessment

Please provide a phone number to call:
  node scripts/educationAssessmentCall.js +1234567890

Dr. Sarah Chen will conduct a comprehensive educational AI maturity assessment.
  `);
  process.exit(1);
}

if (!VAPI_API_KEY) {
  console.error('❌ Please set VAPI_API_KEY in your .env file');
  process.exit(1);
}

async function makeEducationCall() {
  console.log(`
🎓 HumanGlue Education AI Maturity Assessment
============================================

Initiating call with HumanGlue Education AI Assessment

📞 Calling: ${phoneNumber}
🤖 AI-powered assessment assistant
📚 Trained on extensive educational research
⏱️  Duration: ~20 minutes

Assessment will cover:
- Technology Infrastructure & Readiness
- Teaching & Learning Innovation  
- Administrative Efficiency
- Stakeholder Engagement
- AI Adoption & Innovation

Connecting...
`);

  try {
    const response = await fetch('https://api.vapi.ai/call', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        assistantId: ASSISTANT_ID,
        customer: {
          number: phoneNumber,
        },
        phoneNumberId: PHONE_NUMBER_ID,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API call failed: ${error}`);
    }

    const data = await response.json();
    
    console.log(`
✅ Call initiated successfully!

Call ID: ${data.id}
Status: ${data.status}

The AI assistant will:
1. Build rapport and understand your institution
2. Assess current technology and AI usage
3. Identify pain points and opportunities
4. Evaluate stakeholder readiness
5. Determine your AI maturity level (0-10)
6. Provide actionable recommendations

After the call, you'll receive:
- Maturity level assessment
- Key transformation opportunities
- Customized roadmap
- ROI projections

Thank you for choosing HumanGlue Education!
`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\nPlease check your VAPI_API_KEY and phone number format.');
  }
}

makeEducationCall();