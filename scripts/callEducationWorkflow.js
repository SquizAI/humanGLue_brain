#!/usr/bin/env node

const VAPI_API_KEY = process.env.VAPI_API_KEY;
const WORKFLOW_ID = 'f00002b7-6b12-4523-8666-4fad930eb699'; // Education Assessment Workflow
const PHONE_NUMBER_ID = 'd4269d03-3914-404a-a798-aa58570abfb1'; // New education phone: +14482286664

// Get phone number from command line
const phoneNumber = process.argv[2];

if (!phoneNumber) {
  console.log(`
🎓 HumanGlue Education AI Assessment Workflow

Usage: node scripts/callEducationWorkflow.js <phone-number>

Example: node scripts/callEducationWorkflow.js +13057753881

Our AI assistant will conduct a comprehensive educational AI maturity assessment
using a structured workflow with 6 phases:

1. Introduction & Stakeholder Identification
2. Infrastructure Assessment  
3. Teaching & Learning Innovation
4. Stakeholder Readiness
5. Outcomes & Equity
6. Maturity Scoring & Recommendations

Duration: ~20-25 minutes
  `);
  process.exit(1);
}

async function makeWorkflowCall() {
  console.log(`
🎓 HumanGlue Education AI Assessment Workflow
===========================================

📞 Calling: ${phoneNumber}
🤖 Assistant: HumanGlue Education AI Assessment
📊 Workflow: 6-phase structured assessment
⏱️  Duration: ~20-25 minutes

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
        workflowId: WORKFLOW_ID,
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
✅ Education assessment workflow initiated!

Call ID: ${data.id}
Status: ${data.status}

The workflow will guide the AI assistant through:

Phase 1: Introduction & Stakeholder ID
- Build rapport and identify role
- Capture institution details

Phase 2: Infrastructure Assessment
- Technology readiness evaluation
- Device access and connectivity

Phase 3: Teaching & Learning Innovation
- Pedagogical practices assessment
- AI tool adoption levels

Phase 4: Stakeholder Readiness
- Change management evaluation
- Professional development needs

Phase 5: Outcomes & Equity
- Learning outcomes analysis
- Digital divide assessment

Phase 6: Maturity Scoring
- Calculate overall score (0-10)
- Provide actionable recommendations

After the call, you'll receive:
- Comprehensive maturity assessment
- Customized transformation roadmap
- Quick wins and long-term strategy
- ROI projections for your institution

Thank you for choosing HumanGlue Education!
`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\nNote: Vapi may have daily call limits. Try importing your own Twilio number for unlimited calls.');
  }
}

makeWorkflowCall();