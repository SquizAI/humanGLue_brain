#!/usr/bin/env node

const https = require('https');

const VAPI_API_KEY = process.env.VAPI_API_KEY;
const WORKFLOW_ID = 'bd6cea58-d9e5-49f9-8575-bea62b0e7bd4';
const PHONE_NUMBER_ID = 'eb3b2751-1c4d-4dcd-85a4-0bfce22686d0';

const squad = {
  name: "Jake's GlueIQ Assessment Squad",
  members: [
    {
      assistantId: "2429981a-81f6-47a6-9557-1723f4f97481"
    }
  ]
};

function createSquad() {
  const data = JSON.stringify(squad);
  
  const options = {
    hostname: 'api.vapi.ai',
    port: 443,
    path: '/squad',
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
          console.log('✅ Squad created successfully!');
          console.log('');
          console.log('🎯 Squad ID:', result.id);
          console.log('🏢 Squad Name:', result.name);
          console.log('📞 Workflow ID:', WORKFLOW_ID);
          console.log('');
          console.log('🚀 Jake\'s workflow is now ready for incoming calls!');
          console.log('📱 Phone: +18177615671');
          console.log('');
          console.log('Next: Assign this squad to the phone number');
        } else {
          console.error('❌ Squad creation failed:', result);
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

console.log('🚀 Creating squad with Jake\'s workflow...');
console.log('');
createSquad();