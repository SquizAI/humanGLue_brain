#!/usr/bin/env node

const https = require('https');

const VAPI_API_KEY = process.env.VAPI_API_KEY;

const workflow = {
  name: "HumanGlue Adaptive AI Assessment",
  description: "Role-based AI transformation assessment with personalized paths",
  transcriber: {
    provider: "deepgram",
    model: "nova-3"
  },
  voice: {
    provider: "11labs", 
    voiceId: "90ipbRoKi4CpHXvKVtl0",
    model: "eleven_turbo_v2_5"
  },
  firstMessage: "Hello! I'm your HumanGlue AI transformation specialist. I'll conduct a personalized AI assessment tailored to your specific role and department. To customize this for maximum value, may I get your name, job title, department, and decision-making authority regarding AI initiatives?",
  systemMessage: "You conduct personalized AI assessments that adapt based on the caller's role, department, and authority level. First identify their role using identify_role_department tool, then use role-specific assessment tools: assess_cto_technical_perspective for technical leaders, assess_cfo_financial_perspective for finance leaders, assess_chro_people_perspective for HR leaders, assess_department_manager_perspective for managers, or general tools for individual contributors. Customize questions and recommendations to their specific responsibilities and decision-making scope.",
  toolIds: [
    "613f5b4c-1d4d-4040-9be0-da6860af78c5",
    "5f68bd48-73d4-4919-bcb3-dc77b07189e3", 
    "14abcd87-1081-4860-84c5-ec75ac9a5223",
    "6a0d58fe-88c5-41e0-83a4-6a7c26bc2b60",
    "848a5ac8-d071-47a2-9984-86179f941ca7",
    "70b03e2f-0c3e-4a98-b432-43e6cbe6fc11",
    "6acdb3e8-2643-4ead-8081-a3bd8a3e95f1",
    "fdffb61e-9539-49e8-b07e-63111d23e797",
    "35005ceb-3462-4181-baed-c83c95872c6e",
    "5d9fed23-cf63-4536-8e88-cdb03815e216",
    "f874b3c8-32e2-4ebd-b862-1987ac1366ba",
    "59d50262-54b5-43fc-825f-9d9b39151022",
    "d444434b-5fdb-42da-95e3-35fcf2048d79",
    "b5b31988-b22a-4fee-837c-03abb0613573",
    "9a45ac8a-2cf7-448a-b499-49a0c8d6254d",
    "02065610-a6bb-4cda-9cd0-d2f334e0c3b6"
  ]
};

function deployWorkflow() {
  const data = JSON.stringify(workflow);
  
  const options = {
    hostname: 'api.vapi.ai',
    port: 443,
    path: '/assistant',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VAPI_API_KEY}`,
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = https.request(options, (res) => {
    let responseData = '';
    
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      try {
        const result = JSON.parse(responseData);
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log('✅ Adaptive Assessment Assistant deployed successfully!');
          console.log('');
          console.log('🎯 Assistant ID:', result.id);
          console.log('📱 Assessment Features:');
          console.log('   🔍 Dynamic Role Identification');
          console.log('   👑 CTO/IT Leadership Assessment');
          console.log('   💰 CFO/Finance Leadership Assessment'); 
          console.log('   👥 CHRO/HR Leadership Assessment');
          console.log('   🏢 Department Manager Assessment');
          console.log('   🔧 Individual Contributor Assessment');
          console.log('');
          console.log('🎨 PERSONALIZATION:');
          console.log('   • Questions adapt to role & authority');
          console.log('   • Department-specific analysis');
          console.log('   • Customized recommendations');
          console.log('   • Role-appropriate insights');
          console.log('');
          console.log('⏱️  Duration: 20-25 minutes (adaptive)');
          console.log('🎧 Voice: Enhanced 11Labs');
          console.log('📊 Results: Role-specific roadmap');
          console.log('');
          console.log('🚀 Ready for personalized calls!');
        } else {
          console.error('❌ Deployment failed:', result);
        }
      } catch (error) {
        console.error('❌ Failed to parse response:', responseData);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request failed:', error);
  });

  req.write(data);
  req.end();
}

console.log('🚀 Deploying Adaptive Assessment Assistant...');
deployWorkflow();