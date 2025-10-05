#!/usr/bin/env node

const https = require('https');

const VAPI_API_KEY = process.env.VAPI_API_KEY;
const WORKFLOW_ID = 'bd6cea58-d9e5-49f9-8575-bea62b0e7bd4';

const updatedWorkflow = {
  name: "GlueIQ Comprehensive Assessment - Simple Questions",
  nodes: [
    {
      name: "welcome_and_qualify",
      type: "conversation",
      prompt: "Start warmly and ask SHORT questions. 'Hi! Thanks for joining our GlueIQ assessment.' Then ask ONE question at a time: 'What department do you work in?' Wait for answer. 'What's your role there?' Wait. 'How long have you been with GlueIQ?' Continue with short follow-ups about their daily focus, biggest challenges, and transformation influence. Use qualify_glueiq_employee tool. Keep each question under 15 words.",
      isStart: true,
      metadata: {
        position: { x: 0, y: 0 }
      },
      messagePlan: {
        firstMessage: "Hi! Thanks for joining our GlueIQ assessment. What department do you work in?"
      },
      variableExtractionPlan: {
        output: [
          {
            type: "string",
            title: "employee_department",
            description: "Their department at GlueIQ"
          },
          {
            type: "string",
            title: "role_level",
            description: "Their role level"
          }
        ]
      }
    },
    {
      name: "pain_and_urgency",
      type: "conversation",
      prompt: "Ask SHORT, direct questions about business threats. Break it down: 'What could hurt GlueIQ if we don't change?' Wait for answer. 'Who's moving faster than us?' Wait. 'How urgent does transformation feel to you?' One question at a time. Keep each under 15 words. Use assess_transformation_readiness_comprehensive tool.",
      metadata: {
        position: { x: 0, y: 300 }
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
      prompt: "Simple questions about vision: 'How clear is our transformation vision to you?' Wait. 'Does leadership communicate direction well?' Wait. 'Do you understand where we're headed?' Keep questions short and conversational.",
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
      name: "culture_and_people",
      type: "conversation", 
      prompt: "Break culture assessment into bite-sized questions: 'Can people take risks without fear here?' Wait. 'Do you feel heard and valued?' Wait. 'How do different generations work together?' Continue with short questions about conflicts, satisfaction. Use assess_psychological_safety, assess_conflict_workplace, assess_intergenerational_dynamics tools. One question at a time.",
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
      prompt: "Simple tech questions: 'What AI tools do you use?' Wait. 'How comfortable are you with new tech?' Wait. 'What tech challenges do you notice?' Keep questions under 15 words. Use assess_ai_adoption_patterns tool.",
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
      prompt: "Short questions about execution: 'How do projects typically go here?' Wait. 'Do teams collaborate well?' Wait. 'Are we good at delivering on time?' Keep it simple and conversational.",
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
      prompt: "Simple experience questions: 'How well does remote work work?' Wait. 'Do you feel like you belong here?' Wait. 'Can you be authentic at work?' Short, caring questions. Use assess_employee_churn_enps tool.",
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
      name: "insights_and_scoring",
      type: "conversation",
      prompt: "Present findings simply and positively. Use calculate_maturity_score tool. Share insights in plain language: 'Here's what I found...' Keep it warm and encouraging. Highlight 2-3 key strengths and 2-3 growth areas.",
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
      name: "simple_recommendations",
      type: "conversation",
      prompt: "Give them 2-3 specific, simple actions they can take in their role. Use complete_assessment tool. End on an inspiring note: 'You can make a real difference by...' Keep recommendations actionable and relevant to their position.",
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
      from: "welcome_and_qualify",
      to: "pain_and_urgency",
      condition: {
        type: "ai",
        prompt: "Qualification completed with department, role, and basic info"
      }
    },
    {
      from: "pain_and_urgency", 
      to: "vision_clarity",
      condition: {
        type: "ai",
        prompt: "Pain and urgency questions answered"
      }
    },
    {
      from: "vision_clarity",
      to: "culture_and_people",
      condition: {
        type: "ai",
        prompt: "Vision clarity assessed"
      }
    },
    {
      from: "culture_and_people",
      to: "ai_and_tech",
      condition: {
        type: "ai",
        prompt: "Culture assessment completed"
      }
    },
    {
      from: "ai_and_tech",
      to: "project_execution",
      condition: {
        type: "ai",
        prompt: "AI and tech readiness assessed"
      }
    },
    {
      from: "project_execution",
      to: "employee_experience", 
      condition: {
        type: "ai",
        prompt: "Project execution assessed"
      }
    },
    {
      from: "employee_experience",
      to: "insights_and_scoring",
      condition: {
        type: "ai",
        prompt: "Employee experience assessed"
      }
    },
    {
      from: "insights_and_scoring",
      to: "simple_recommendations",
      condition: {
        type: "ai",
        prompt: "Insights shared and scoring completed"
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
          console.log('✅ GlueIQ Workflow UPDATED with shorter questions!');
          console.log('');
          console.log('🎯 Updated Features:');
          console.log('   • SHORT questions under 15 words');
          console.log('   • ONE question at a time');
          console.log('   • Break complex topics into bite-sized pieces');
          console.log('   • More conversational and natural');
          console.log('   • Less wordy, more engaging');
          console.log('');
          console.log('📝 Question Style:');
          console.log('   ❌ "Can you tell me about your role, responsibilities, and how long you\'ve been here?"');
          console.log('   ✅ "What department do you work in?" (wait) "What\'s your role there?" (wait)');
          console.log('');
          console.log('🚀 Ready for natural, engaging conversations!');
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

console.log('🔄 Updating GlueIQ Workflow with shorter questions...');
console.log('');
updateWorkflow();