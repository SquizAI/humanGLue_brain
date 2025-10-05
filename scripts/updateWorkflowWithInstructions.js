#!/usr/bin/env node

const https = require('https');

const VAPI_API_KEY = process.env.VAPI_API_KEY;
const WORKFLOW_ID = 'bd6cea58-d9e5-49f9-8575-bea62b0e7bd4';

const updatedWorkflow = {
  name: "GlueIQ Comprehensive Assessment - Natural Conversation",
  nodes: [
    {
      name: "welcome_and_instructions",
      type: "conversation",
      prompt: "Start with warm welcome, duration, and clear instructions about natural conversation. Say: 'Hi! Thanks for joining our GlueIQ assessment. This will take about 20 minutes - just a friendly conversation about how we're doing as a company. You can talk to me completely naturally, like you're chatting with a colleague. Feel free to interrupt, ask questions, or expand on anything.' Then ask: 'What department do you work in?' Keep questions short and conversational.",
      isStart: true,
      metadata: {
        position: { x: 0, y: 0 }
      },
      messagePlan: {
        firstMessage: "Hi! Thanks for joining our GlueIQ assessment. This will take about 20 minutes - just a friendly conversation about how we're doing as a company. You can talk to me completely naturally, like you're chatting with a colleague. Feel free to interrupt, ask questions, or expand on anything. What department do you work in?"
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
            title: "conversation_comfort",
            description: "How comfortable they seem with natural conversation"
          }
        ]
      }
    },
    {
      name: "role_qualification",
      type: "conversation",
      prompt: "Continue qualification naturally. Ask SHORT questions one at a time: 'What's your role there?' Wait. 'How long have you been with GlueIQ?' Wait. 'What do you focus on day to day?' Continue with biggest challenges and transformation influence. Use qualify_glueiq_employee tool. Remind them they can talk naturally if they seem formal.",
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
            title: "transformation_influence",
            description: "Their influence on transformation decisions"
          }
        ]
      }
    },
    {
      name: "pain_and_urgency",
      type: "conversation",
      prompt: "Ask about business challenges naturally: 'What could hurt GlueIQ if we don't change?' Let them talk freely. Follow up: 'Who's moving faster than us?' Encourage natural responses. 'How urgent does transformation feel to you?' Use assess_transformation_readiness_comprehensive tool.",
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
      prompt: "Natural questions about vision: 'How clear is our transformation vision to you?' Let them elaborate. 'Does leadership communicate direction well?' Encourage honest feedback. 'Do you understand where we're headed?' Allow natural conversation flow.",
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
      prompt: "Explore culture naturally: 'Can people take risks without fear here?' Let them share stories. 'Do you feel heard and valued?' Encourage examples. 'How do different generations work together?' Use assess_psychological_safety, assess_conflict_workplace, assess_intergenerational_dynamics tools. Let conversation flow naturally.",
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
      prompt: "Casual tech conversation: 'What AI tools do you use?' Let them explain. 'How comfortable are you with new tech?' Encourage sharing. 'What tech challenges do you notice?' Allow natural discussion. Use assess_ai_adoption_patterns tool.",
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
      prompt: "Natural execution discussion: 'How do projects typically go here?' Let them share experiences. 'Do teams collaborate well?' Encourage stories. 'Are we good at delivering on time?' Allow natural flow.",
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
      prompt: "Personal experience chat: 'How well does remote work work for you?' Let them elaborate. 'Do you feel like you belong here?' Encourage honesty. 'Can you be authentic at work?' Use assess_employee_churn_enps tool. Keep it conversational.",
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
      prompt: "Share findings conversationally: 'Here's what I'm hearing...' Use calculate_maturity_score tool. Present insights like you're talking to a friend: 'It sounds like GlueIQ has some real strengths...' Encourage questions and discussion.",
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
      name: "natural_recommendations",
      type: "conversation",
      prompt: "Give recommendations conversationally: 'Based on what you've shared, here are a few things you could do...' Use complete_assessment tool. Make it feel like friendly advice: 'You're in a great position to...' Encourage questions about next steps.",
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
      from: "welcome_and_instructions",
      to: "role_qualification",
      condition: {
        type: "ai",
        prompt: "Natural conversation instructions given and initial department question answered"
      }
    },
    {
      from: "role_qualification",
      to: "pain_and_urgency",
      condition: {
        type: "ai",
        prompt: "Role qualification completed"
      }
    },
    {
      from: "pain_and_urgency", 
      to: "vision_clarity",
      condition: {
        type: "ai",
        prompt: "Pain and urgency discussed"
      }
    },
    {
      from: "vision_clarity",
      to: "culture_and_people",
      condition: {
        type: "ai",
        prompt: "Vision clarity explored"
      }
    },
    {
      from: "culture_and_people",
      to: "ai_and_tech",
      condition: {
        type: "ai",
        prompt: "Culture conversation completed"
      }
    },
    {
      from: "ai_and_tech",
      to: "project_execution",
      condition: {
        type: "ai",
        prompt: "AI and tech discussion finished"
      }
    },
    {
      from: "project_execution",
      to: "employee_experience", 
      condition: {
        type: "ai",
        prompt: "Project execution discussed"
      }
    },
    {
      from: "employee_experience",
      to: "insights_and_scoring",
      condition: {
        type: "ai",
        prompt: "Employee experience conversation completed"
      }
    },
    {
      from: "insights_and_scoring",
      to: "natural_recommendations",
      condition: {
        type: "ai",
        prompt: "Insights shared and discussed"
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
          console.log('✅ Workflow UPDATED with natural conversation instructions!');
          console.log('');
          console.log('🗣️ NEW OPENING:');
          console.log('"Hi! Thanks for joining our GlueIQ assessment. Just so you know,');
          console.log('you can talk to me completely naturally - like you\'re chatting');
          console.log('with a colleague. Feel free to interrupt, ask questions, or');
          console.log('expand on anything. This is just a friendly conversation about');
          console.log('how we\'re doing as a company."');
          console.log('');
          console.log('🎯 CONVERSATION FEATURES:');
          console.log('   • Permission to interrupt and ask questions');
          console.log('   • Encouragement to elaborate and share stories');
          console.log('   • Natural back-and-forth dialogue');
          console.log('   • Feels like chatting with a colleague');
          console.log('   • Removes formal interview pressure');
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

console.log('🔄 Adding natural conversation instructions to workflow...');
console.log('');
updateWorkflow();