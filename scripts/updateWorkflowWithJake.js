#!/usr/bin/env node

const https = require('https');

const VAPI_API_KEY = process.env.VAPI_API_KEY;
const WORKFLOW_ID = 'bd6cea58-d9e5-49f9-8575-bea62b0e7bd4';

const updatedWorkflow = {
  name: "Jake's GlueIQ Assessment - Natural Conversation",
  nodes: [
    {
      name: "welcome_with_jake",
      type: "conversation",
      prompt: "You are Jake conducting the GlueIQ assessment. Start with: 'Hi! I'm Jake. Thanks for joining our GlueIQ assessment. This will take about 20 minutes - just a friendly conversation about how we're doing as a company. You can talk to me completely naturally, like you're chatting with a colleague. Feel free to interrupt, ask questions, or expand on anything.' Then ask ONE simple question: 'What department do you work in?' Wait for their answer before asking anything else.",
      isStart: true,
      metadata: {
        position: { x: 0, y: 0 }
      },
      messagePlan: {
        firstMessage: "Hi! I'm Jake. Thanks for joining our GlueIQ assessment. This will take about 20 minutes - just a friendly conversation about how we're doing as a company. You can talk to me completely naturally, like you're chatting with a colleague. Feel free to interrupt, ask questions, or expand on anything. What department do you work in?"
      },
      variableExtractionPlan: {
        output: [
          {
            type: "string",
            title: "employee_department",
            description: "Their department at GlueIQ"
          }
        ]
      }
    },
    {
      name: "role_qualification",
      type: "conversation",
      prompt: "Continue with Jake's friendly style. Ask SHORT questions ONE at a time: 'What's your role there?' Wait for answer. Then 'How long have you been with GlueIQ?' Wait. Then 'What do you focus on day to day?' Keep each question under 15 words. Wait for complete answers before moving on.",
      metadata: {
        position: { x: 0, y: 200 }
      },
      variableExtractionPlan: {
        output: [
          {
            type: "string",
            title: "role_level",
            description: "Their role level"
          },
          {
            type: "string",
            title: "daily_focus",
            description: "What they focus on daily"
          }
        ]
      }
    },
    {
      name: "pain_and_urgency",
      type: "conversation",
      prompt: "Jake asks about challenges with SHORT questions: 'What could hurt GlueIQ if we don't change?' Wait for full answer. Then 'Who's moving faster than us?' Wait. Then 'How urgent does transformation feel to you?' One question at a time, under 15 words each.",
      metadata: {
        position: { x: 0, y: 400 }
      },
      variableExtractionPlan: {
        output: [
          {
            type: "string",
            title: "urgency_level",
            description: "How urgent transformation feels"
          }
        ]
      }
    },
    {
      name: "vision_clarity",
      type: "conversation",
      prompt: "Jake explores vision with simple questions: 'How clear is our transformation vision to you?' Wait. 'Does leadership communicate direction well?' Wait. 'Do you understand where we're headed?' Each question under 15 words, wait for complete answers.",
      metadata: {
        position: { x: -300, y: 600 }
      },
      variableExtractionPlan: {
        output: [
          {
            type: "string",
            title: "vision_clarity",
            description: "How clear the vision is"
          }
        ]
      }
    },
    {
      name: "culture_and_safety",
      type: "conversation", 
      prompt: "Jake asks about workplace culture: 'Can people take risks without fear here?' Wait. 'Do you feel heard and valued?' Wait. 'How do different generations work together?' Short questions, natural conversation flow.",
      metadata: {
        position: { x: 0, y: 600 }
      },
      variableExtractionPlan: {
        output: [
          {
            type: "string",
            title: "culture_score",
            description: "Overall culture health"
          }
        ]
      }
    },
    {
      name: "ai_and_tech",
      type: "conversation",
      prompt: "Jake explores tech readiness: 'What AI tools do you use?' Wait. 'How comfortable are you with new tech?' Wait. 'What tech challenges do you notice?' Keep it conversational and short.",
      metadata: {
        position: { x: 300, y: 600 }
      },
      variableExtractionPlan: {
        output: [
          {
            type: "string",
            title: "ai_readiness",
            description: "AI adoption readiness"
          }
        ]
      }
    },
    {
      name: "project_execution",
      type: "conversation",
      prompt: "Jake asks about execution: 'How do projects typically go here?' Wait. 'Do teams collaborate well?' Wait. 'Are we good at delivering on time?' Simple, direct questions.",
      metadata: {
        position: { x: -150, y: 900 }
      },
      variableExtractionPlan: {
        output: [
          {
            type: "string",
            title: "execution_quality",
            description: "Project execution effectiveness"
          }
        ]
      }
    },
    {
      name: "employee_experience",
      type: "conversation",
      prompt: "Jake wraps up with experience questions: 'How well does remote work work for you?' Wait. 'Do you feel like you belong here?' Wait. 'Can you be authentic at work?' Keep Jake's friendly, caring tone.",
      metadata: {
        position: { x: 150, y: 900 }
      },
      variableExtractionPlan: {
        output: [
          {
            type: "string",
            title: "belonging_score",
            description: "Employee belonging level"
          }
        ]
      }
    },
    {
      name: "jake_insights",
      type: "conversation",
      prompt: "Jake shares findings warmly: 'Here's what I'm hearing...' Present insights like Jake is talking to a friend: 'It sounds like GlueIQ has some real strengths...' Keep it conversational and encouraging.",
      metadata: {
        position: { x: 0, y: 1200 }
      },
      variableExtractionPlan: {
        output: [
          {
            type: "string",
            title: "overall_score",
            description: "Overall readiness score"
          }
        ]
      }
    },
    {
      name: "jake_recommendations",
      type: "conversation",
      prompt: "Jake gives friendly recommendations: 'Based on what you've shared, here are a few things you could do...' Make it feel like friendly advice from Jake: 'You're in a great position to...' Encourage questions about next steps.",
      metadata: {
        position: { x: 0, y: 1500 }
      },
      variableExtractionPlan: {
        output: [
          {
            type: "string",
            title: "action_items",
            description: "Personal action items"
          }
        ]
      }
    }
  ],
  edges: [
    {
      from: "welcome_with_jake",
      to: "role_qualification",
      condition: {
        type: "ai",
        prompt: "Jake gave welcome and got department info"
      }
    },
    {
      from: "role_qualification",
      to: "pain_and_urgency",
      condition: {
        type: "ai",
        prompt: "Role qualification completed with Jake"
      }
    },
    {
      from: "pain_and_urgency", 
      to: "vision_clarity",
      condition: {
        type: "ai",
        prompt: "Pain and urgency discussed with Jake"
      }
    },
    {
      from: "vision_clarity",
      to: "culture_and_safety",
      condition: {
        type: "ai",
        prompt: "Vision clarity explored with Jake"
      }
    },
    {
      from: "culture_and_safety",
      to: "ai_and_tech",
      condition: {
        type: "ai",
        prompt: "Culture conversation completed with Jake"
      }
    },
    {
      from: "ai_and_tech",
      to: "project_execution",
      condition: {
        type: "ai",
        prompt: "AI and tech discussion finished with Jake"
      }
    },
    {
      from: "project_execution",
      to: "employee_experience", 
      condition: {
        type: "ai",
        prompt: "Project execution discussed with Jake"
      }
    },
    {
      from: "employee_experience",
      to: "jake_insights",
      condition: {
        type: "ai",
        prompt: "Employee experience conversation completed with Jake"
      }
    },
    {
      from: "jake_insights",
      to: "jake_recommendations",
      condition: {
        type: "ai",
        prompt: "Jake shared insights and they were discussed"
      }
    }
  ]
};

function updateWorkflow() {
  const data = JSON.stringify(updatedWorkflow);
  
  const options = {
    hostname: 'api.vapi.ai',
    port: 443,
    path: `/workflow/${WORKFLOW_ID}`,
    method: 'PATCH',
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
          console.log('✅ Workflow UPDATED with Jake and abbreviated questions!');
          console.log('');
          console.log('👋 MEET JAKE:');
          console.log('   • Friendly GlueIQ assessment specialist');
          console.log('   • Natural, conversational tone');
          console.log('   • Makes interruptions feel welcome');
          console.log('');
          console.log('📝 QUESTION STYLE:');
          console.log('   ✅ "What department do you work in?" (wait)');
          console.log('   ✅ "What\'s your role there?" (wait)');
          console.log('   ✅ "How long have you been with GlueIQ?" (wait)');
          console.log('   ❌ NO multiple choice questions');
          console.log('   ❌ NO wordy complex questions');
          console.log('');
          console.log('🎯 JAKE\'S APPROACH:');
          console.log('   • ONE question at a time');
          console.log('   • Under 15 words per question');
          console.log('   • Waits for complete answers');
          console.log('   • Feels like chatting with a colleague');
          console.log('');
          console.log('🚀 Workflow ready for natural conversations with Jake!');
        } else {
          console.error('❌ Update failed:', result);
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

console.log('🔄 Adding Jake and abbreviated questions to workflow...');
console.log('');
updateWorkflow();