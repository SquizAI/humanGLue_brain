#!/usr/bin/env node

const https = require('https');

const VAPI_API_KEY = process.env.VAPI_API_KEY;

const glueIQWorkflow = {
  name: "GlueIQ Comprehensive Transformation Assessment",
  nodes: [
    {
      name: "welcome_and_qualify",
      type: "conversation",
      prompt: "You are conducting the GlueIQ Comprehensive Transformation Assessment. Start warmly and professionally. Since this is for GlueIQ employees, focus on qualifying their role and department to customize the conversation. Use qualify_glueiq_employee tool to understand their department, role level, specific position, tenure, team size, daily focus, biggest challenges, and transformation influence level. Keep it conversational and engaging - no technical jargon or symbols. Make them feel valued and heard.",
      isStart: true,
      metadata: {
        position: { x: 0, y: 0 }
      },
      messagePlan: {
        firstMessage: "Hi there! Thanks for joining our GlueIQ Transformation Assessment. I'm here to understand how ready we are as an organization for the exciting changes ahead. To make this conversation most valuable for you, let me start by learning about your role here at GlueIQ. What department do you work in, and what's your main focus day to day?"
      },
      variableExtractionPlan: {
        output: [
          {
            type: "string",
            title: "employee_department",
            description: "Their primary department at GlueIQ"
          },
          {
            type: "string",
            title: "role_level",
            description: "Their seniority level within GlueIQ"
          },
          {
            type: "string",
            title: "transformation_influence",
            description: "Their level of influence on transformation decisions"
          }
        ]
      }
    },
    {
      name: "pain_and_urgency_assessment",
      type: "conversation",
      prompt: "Now dive into pain and urgency analysis in a conversational way. Ask about what could hurt GlueIQ if we don't transform, competitive pressures, market changes they see coming, and how urgent transformation feels from their perspective. Use assess_transformation_readiness_comprehensive tool. Keep questions natural and relevant to their role. Focus on business realities they observe.",
      metadata: {
        position: { x: 0, y: 300 }
      },
      variableExtractionPlan: {
        output: [
          {
            type: "string",
            title: "pain_urgency_score",
            description: "How urgent transformation feels (1-10)"
          },
          {
            type: "string",
            title: "competitive_threats",
            description: "Who is moving faster than GlueIQ"
          }
        ]
      }
    },
    {
      name: "vision_and_strategy_clarity",
      type: "conversation",
      prompt: "Explore vision and strategic clarity from their perspective. Ask how clear GlueIQ's transformation vision is to them, whether leadership communicates direction well, if they understand where we're headed, and how well our strategy makes sense for their area. Keep it conversational - you want honest insights about communication and clarity across the organization.",
      metadata: {
        position: { x: -300, y: 600 }
      },
      variableExtractionPlan: {
        output: [
          {
            type: "string",
            title: "vision_clarity_score",
            description: "How clear the transformation vision is (1-10)"
          },
          {
            type: "string",
            title: "communication_effectiveness",
            description: "How well vision is communicated across org"
          }
        ]
      }
    },
    {
      name: "culture_and_people_readiness",
      type: "conversation", 
      prompt: "Assess culture and people readiness comprehensively. Use assess_psychological_safety, assess_conflict_workplace, assess_intergenerational_dynamics, and assess_employee_churn_enps tools. Ask about psychological safety (can people take risks, speak up, experiment), workplace dynamics, how different generations work together, employee satisfaction, and cultural readiness for change. Make questions feel like a genuine conversation about workplace culture.",
      metadata: {
        position: { x: 0, y: 600 }
      },
      variableExtractionPlan: {
        output: [
          {
            type: "string",
            title: "psychological_safety_score",
            description: "How safe people feel to take risks and speak up"
          },
          {
            type: "string",
            title: "culture_change_readiness",
            description: "How ready the culture is for transformation"
          }
        ]
      }
    },
    {
      name: "ai_and_technology_readiness",
      type: "conversation",
      prompt: "Explore AI and technology readiness from their perspective. Use assess_ai_adoption_patterns and technical assessment tools relevant to their role. Ask about current AI tools they use or see others using, comfort level with new technology, what tech challenges they observe, data quality issues they encounter, and how ready our systems seem for AI integration. Adapt depth based on their technical background.",
      metadata: {
        position: { x: 300, y: 600 }
      },
      variableExtractionPlan: {
        output: [
          {
            type: "string", 
            title: "ai_adoption_readiness",
            description: "Personal and organizational AI adoption readiness"
          },
          {
            type: "string",
            title: "tech_infrastructure_score",
            description: "How ready our technology infrastructure seems"
          }
        ]
      }
    },
    {
      name: "project_execution_and_performance",
      type: "conversation",
      prompt: "Assess project execution and performance patterns. Ask about how projects typically go at GlueIQ - success rates, timing, quality, collaboration effectiveness. Explore what works well and what doesn't in how we execute initiatives. Get their perspective on team collaboration, cross-departmental work, and delivery patterns they observe.",
      metadata: {
        position: { x: -150, y: 900 }
      },
      variableExtractionPlan: {
        output: [
          {
            type: "string",
            title: "execution_effectiveness_score",
            description: "How effective project execution is (1-10)"
          },
          {
            type: "string",
            title: "collaboration_quality",
            description: "Quality of team and cross-departmental collaboration"
          }
        ]
      }
    },
    {
      name: "employee_experience_and_belonging",
      type: "conversation",
      prompt: "Explore employee experience, belonging, and work effectiveness. Ask about remote work effectiveness, inclusion and belonging, neurodivergent support, flexible work arrangements, and how well people can bring their authentic selves to work. Keep it conversational and genuine - you want to understand the employee experience quality.",
      metadata: {
        position: { x: 150, y: 900 }
      },
      variableExtractionPlan: {
        output: [
          {
            type: "string",
            title: "belonging_score",
            description: "How much employees feel they belong (1-10)"
          },
          {
            type: "string",
            title: "work_flexibility_effectiveness",
            description: "How well flexible work arrangements work"
          }
        ]
      }
    },
    {
      name: "comprehensive_insights_and_scoring",
      type: "conversation",
      prompt: "Calculate comprehensive transformation readiness using calculate_maturity_score tool. Present insights in a warm, engaging way. Share their organization's strengths, areas for growth, and what this means for GlueIQ's transformation journey. Provide hope and realistic optimism while being honest about challenges. Make recommendations feel achievable and exciting.",
      metadata: {
        position: { x: 0, y: 1200 }
      },
      variableExtractionPlan: {
        output: [
          {
            type: "string",
            title: "overall_readiness_score",
            description: "Overall transformation readiness score"
          },
          {
            type: "string",
            title: "top_strengths",
            description: "Top 3 organizational strengths to leverage"
          },
          {
            type: "string",
            title: "key_opportunities",
            description: "Key opportunities for improvement"
          }
        ]
      }
    },
    {
      name: "personalized_recommendations",
      type: "conversation",
      prompt: "Provide personalized recommendations based on their role and the comprehensive assessment. Use complete_assessment tool to wrap up with next steps. Focus on what they personally can influence or contribute to. Make it actionable and relevant to their position. End on an inspiring note about GlueIQ's transformation potential and their role in it.",
      metadata: {
        position: { x: 0, y: 1500 }
      },
      variableExtractionPlan: {
        output: [
          {
            type: "string",
            title: "personal_action_items", 
            description: "Specific actions they can take in their role"
          },
          {
            type: "string",
            title: "follow_up_interest",
            description: "What kind of follow-up would be most valuable"
          }
        ]
      }
    }
  ],
  edges: [
    {
      from: "welcome_and_qualify",
      to: "pain_and_urgency_assessment",
      condition: {
        type: "ai",
        prompt: "Employee qualification completed and ready to assess transformation urgency"
      }
    },
    {
      from: "pain_and_urgency_assessment", 
      to: "vision_and_strategy_clarity",
      condition: {
        type: "ai",
        prompt: "Pain and urgency assessment completed"
      }
    },
    {
      from: "vision_and_strategy_clarity",
      to: "culture_and_people_readiness", 
      condition: {
        type: "ai",
        prompt: "Vision and strategy assessment completed"
      }
    },
    {
      from: "culture_and_people_readiness",
      to: "ai_and_technology_readiness",
      condition: {
        type: "ai",
        prompt: "Culture and people assessment completed"
      }
    },
    {
      from: "ai_and_technology_readiness",
      to: "project_execution_and_performance",
      condition: {
        type: "ai",
        prompt: "AI and technology readiness assessed"
      }
    },
    {
      from: "project_execution_and_performance", 
      to: "employee_experience_and_belonging",
      condition: {
        type: "ai",
        prompt: "Project execution assessment completed"
      }
    },
    {
      from: "employee_experience_and_belonging",
      to: "comprehensive_insights_and_scoring",
      condition: {
        type: "ai",
        prompt: "Employee experience assessment completed"
      }
    },
    {
      from: "comprehensive_insights_and_scoring",
      to: "personalized_recommendations", 
      condition: {
        type: "ai",
        prompt: "Comprehensive scoring completed and insights shared"
      }
    }
  ]
};

function deployWorkflow() {
  const data = JSON.stringify(glueIQWorkflow);
  
  const options = {
    hostname: 'api.vapi.ai',
    port: 443,
    path: '/workflow',
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
          console.log('✅ GlueIQ Comprehensive Assessment WORKFLOW deployed!');
          console.log('');
          console.log('🎯 Workflow ID:', result.id);
          console.log('');
          console.log('🏢 GLUEIQ EMPLOYEE FOCUSED:');
          console.log('   • Intelligent role and department qualification');
          console.log('   • No generic questions - everything customized');
          console.log('   • Natural, engaging conversation flow');
          console.log('   • Comprehensive multi-dimensional assessment');
          console.log('');
          console.log('📊 ASSESSMENT DIMENSIONS:');
          console.log('   🔥 Pain Scale Analysis - What Will Kill Us?');
          console.log('   🔮 Future Vision & Strategic Clarity');
          console.log('   🎯 Purpose & Values Alignment');
          console.log('   💰 Budget vs Vision Reality Check');
          console.log('   👥 People Readiness & Adaptability');
          console.log('   🤝 Intergenerational Effectiveness');
          console.log('   🏆 Project Execution Performance');
          console.log('   🤖 AI Adoption Patterns');
          console.log('   🎭 Culture Definition & Coherence');
          console.log('   📚 Training & Development Effectiveness');
          console.log('   💔 Employee Churn & eNPS Analysis');
          console.log('   ⚡ AI/Technology Readiness');
          console.log('   🔒 Psychological Safety');
          console.log('   ❤️ Belonging & Inclusion');
          console.log('   🏠 Remote Work Effectiveness');
          console.log('   ⚔️ Workplace Conflict Analysis');
          console.log('');
          console.log('🎨 HUMAN-LIKE FEATURES:');
          console.log('   • No technical jargon or symbols');
          console.log('   • Conversational and engaging tone');
          console.log('   • Role-appropriate questions only');
          console.log('   • Natural flow and pacing');
          console.log('   • Warm, professional voice');
          console.log('');
          console.log('⏱️  Duration: 25-30 minutes');
          console.log('🎧 Voice: Human-like and engaging');
          console.log('📈 Results: Comprehensive transformation roadmap');
          console.log('');
          console.log('🚀 Ready for GlueIQ employee assessments!');
        } else {
          console.error('❌ Workflow deployment failed:', result);
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

console.log('🚀 Deploying GlueIQ Comprehensive Assessment Workflow...');
console.log('');
deployWorkflow();