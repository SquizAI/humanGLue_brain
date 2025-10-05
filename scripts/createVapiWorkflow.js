#!/usr/bin/env node

const https = require('https');

const VAPI_API_KEY = process.env.VAPI_API_KEY;

const adaptiveWorkflow = {
  name: "HumanGlue Adaptive AI Assessment",
  nodes: [
    {
      name: "role_identification",
      type: "conversation", 
      prompt: "You are starting the HumanGlue Adaptive AI Assessment. Your first priority is to identify the caller's role, department, and decision-making authority to customize the entire assessment. Use the identify_role_department tool to capture: role level (C-Suite/VP/Director/Manager/Individual Contributor), department, job title, decision authority, team size, and primary concerns. Be thorough as this determines the assessment path.",
      isStart: true,
      metadata: {
        position: { x: 0, y: 0 }
      },
      messagePlan: {
        firstMessage: "Hello! I'm your HumanGlue AI transformation specialist. I'll conduct a personalized AI assessment tailored specifically to your role and responsibilities. To customize this for maximum value, may I get your name, job title, department, and what level of decision-making authority you have regarding technology and transformation initiatives?"
      },
      variableExtractionPlan: {
        output: [
          {
            type: "string",
            title: "role_level", 
            description: "Leadership level (C-Suite, VP, Director, Manager, Individual Contributor)"
          },
          {
            type: "string",
            title: "department",
            description: "Primary department/function"
          },
          {
            type: "string", 
            title: "job_title",
            description: "Specific job title and role"
          },
          {
            type: "string",
            title: "decision_authority", 
            description: "Decision-making authority level"
          }
        ]
      }
    },
    {
      name: "cto_technical_assessment",
      type: "conversation",
      prompt: "Conduct CTO/IT Leadership focused assessment. Use assess_cto_technical_perspective tool to evaluate: tech stack modernity (1-10), team technical skills and gaps, data architecture maturity (1-10), vendor ecosystem, security compliance, budget constraints, implementation challenges, and team readiness (1-10). Ask pointed questions about architecture decisions, technical feasibility, and implementation roadmaps. Also use assess_pain_urgency for technical threats and competitive pressures.",
      metadata: {
        position: { x: -300, y: 300 }
      },
      variableExtractionPlan: {
        output: [
          {
            type: "string",
            title: "tech_stack_score",
            description: "Technology stack modernity rating (1-10)"
          },
          {
            type: "string", 
            title: "technical_challenges",
            description: "Biggest technical implementation challenges"
          }
        ]
      }
    },
    {
      name: "cfo_financial_assessment", 
      type: "conversation",
      prompt: "Conduct CFO/Finance Leadership focused assessment. Use assess_cfo_financial_perspective tool to evaluate: ROI expectations and timeline, budget allocation for AI, risk tolerance, payback period expectations, cost optimization priorities, competitive advantage goals, implementation cost understanding, and financial metrics for success. Focus on business cases, financial modeling, and measurable outcomes.",
      metadata: {
        position: { x: 0, y: 300 }
      },
      variableExtractionPlan: {
        output: [
          {
            type: "string",
            title: "roi_timeline",
            description: "Expected ROI timeline and targets"
          },
          {
            type: "string",
            title: "budget_capacity", 
            description: "Budget allocation and investment capacity"
          }
        ]
      }
    },
    {
      name: "chro_people_assessment",
      type: "conversation", 
      prompt: "Conduct CHRO/HR Leadership focused assessment. Use assess_chro_people_perspective tool to evaluate: workforce readiness (1-10), change management capabilities, talent strategy for AI workforce, critical skills gaps, cultural barriers, employee engagement levels, leadership alignment, and diversity considerations. Also use people-focused tools like assess_psychological_safety, assess_conflict_workplace, and assess_employee_churn_enps.",
      metadata: {
        position: { x: 300, y: 300 }
      },
      variableExtractionPlan: {
        output: [
          {
            type: "string",
            title: "workforce_readiness",
            description: "Employee readiness for AI adoption (1-10)"
          },
          {
            type: "string",
            title: "cultural_barriers",
            description: "Primary cultural barriers to AI adoption"
          }
        ]
      }
    },
    {
      name: "manager_operational_assessment",
      type: "conversation",
      prompt: "Conduct Department Manager focused assessment. Use assess_department_manager_perspective tool to evaluate: team dynamics and AI readiness, day-to-day operational challenges AI could address, implementation concerns and team impact, resource needs for adoption, training requirements, performance metrics improvement potential, stakeholder buy-in levels, and department priority alignment. Focus on ground-level implementation realities.",
      metadata: {
        position: { x: -150, y: 600 }
      },
      variableExtractionPlan: {
        output: [
          {
            type: "string",
            title: "team_readiness",
            description: "Team collaboration and AI readiness within department"
          },
          {
            type: "string",
            title: "implementation_concerns",
            description: "Main concerns about AI implementation impact"
          }
        ]
      }
    },
    {
      name: "individual_contributor_assessment",
      type: "conversation",
      prompt: "Conduct Individual Contributor focused assessment. Focus on personal AI impact: current tools used daily, specific tasks for AI automation, skills development needs, job enhancement vs complexity concerns, training support requirements, and career development opportunities. Use assess_ai_adoption_patterns and assess_psychological_safety from individual perspective. Address practical implementation and user experience.",
      metadata: {
        position: { x: 150, y: 600 }
      },
      variableExtractionPlan: {
        output: [
          {
            type: "string",
            title: "ai_comfort_level",
            description: "Personal comfort level with AI tools (1-10)"
          },
          {
            type: "string",
            title: "skill_development_needs",
            description: "Key skills they want to develop for AI adoption"
          }
        ]
      }
    },
    {
      name: "comprehensive_scoring",
      type: "conversation",
      prompt: "Calculate comprehensive transformation readiness using calculate_maturity_score tool with role context. Present role-specific insights: overall readiness level, category scores relevant to their position, key strengths to leverage, critical barriers to address, transformation roadmap with quick wins and long-term strategy, resource allocation recommendations, and success metrics appropriate to their authority level.",
      metadata: {
        position: { x: 0, y: 900 }
      },
      variableExtractionPlan: {
        output: [
          {
            type: "string",
            title: "overall_readiness_score",
            description: "Overall AI transformation readiness score (0-9)"
          },
          {
            type: "string",
            title: "role_specific_recommendations",
            description: "Key recommendations tailored to their role"
          }
        ]
      }
    },
    {
      name: "results_delivery",
      type: "conversation",
      prompt: "Complete the personalized assessment using complete_assessment tool. Collect contact information for role-specific report delivery: full name and role, email for personalized report, company details, preferred follow-up method and timing, specific focus areas for their role, and implementation timeline preferences. Emphasize the customized value they'll receive.",
      metadata: {
        position: { x: -200, y: 1200 }
      },
      variableExtractionPlan: {
        output: [
          {
            type: "string",
            title: "contact_email",
            description: "Email address for personalized report delivery"
          },
          {
            type: "string",
            title: "follow_up_preferences",
            description: "Preferred follow-up method and timing"
          }
        ]
      }
    },
    {
      name: "specialist_transfer",
      type: "conversation", 
      prompt: "Prepare immediate specialist transfer using transfer_to_specialist tool. Summarize key assessment results: overall readiness level, critical pain points, top strengths to leverage, most critical barriers, and resource considerations. Explain that specialist will have complete assessment context and can provide immediate strategic recommendations within their role and authority.",
      metadata: {
        position: { x: 200, y: 1200 }
      }
    },
    {
      name: "assessment_completion",
      type: "conversation",
      prompt: "Conclude the personalized assessment. Provide role-specific summary: comprehensive assessment completed for their specific position, insights directly relevant to their responsibilities, customized recommendations they can implement, clear next steps tailored to their authority level. Reinforce the personalized value and express confidence in their transformation potential.",
      metadata: {
        position: { x: 0, y: 1500 }
      }
    }
  ],
  edges: [
    {
      from: "role_identification",
      to: "cto_technical_assessment", 
      condition: {
        type: "ai",
        prompt: "Role is CTO, VP Engineering, IT Director, or technical leadership role"
      }
    },
    {
      from: "role_identification",
      to: "cfo_financial_assessment",
      condition: {
        type: "ai", 
        prompt: "Role is CFO, Finance VP/Director, or budget decision maker"
      }
    },
    {
      from: "role_identification", 
      to: "chro_people_assessment",
      condition: {
        type: "ai",
        prompt: "Role is CHRO, HR VP/Director, or people/culture leadership"
      }
    },
    {
      from: "role_identification",
      to: "manager_operational_assessment",
      condition: {
        type: "ai",
        prompt: "Role is Department Manager, Team Lead, or middle management"
      }
    },
    {
      from: "role_identification",
      to: "individual_contributor_assessment",
      condition: {
        type: "ai", 
        prompt: "Role is Individual Contributor, Analyst, or hands-on implementer"
      }
    },
    {
      from: "cto_technical_assessment",
      to: "comprehensive_scoring",
      condition: {
        type: "ai",
        prompt: "Technical assessment completed across all dimensions"
      }
    },
    {
      from: "cfo_financial_assessment",
      to: "comprehensive_scoring", 
      condition: {
        type: "ai",
        prompt: "Financial assessment completed across all dimensions"
      }
    },
    {
      from: "chro_people_assessment",
      to: "comprehensive_scoring",
      condition: {
        type: "ai",
        prompt: "People and culture assessment completed across all dimensions"
      }
    },
    {
      from: "manager_operational_assessment",
      to: "comprehensive_scoring",
      condition: {
        type: "ai",
        prompt: "Department and operational assessment completed"
      }
    },
    {
      from: "individual_contributor_assessment", 
      to: "comprehensive_scoring",
      condition: {
        type: "ai",
        prompt: "Individual contributor assessment completed"
      }
    },
    {
      from: "comprehensive_scoring",
      to: "results_delivery",
      condition: {
        type: "ai",
        prompt: "Scores calculated and user wants detailed results and report"
      }
    },
    {
      from: "comprehensive_scoring",
      to: "specialist_transfer",
      condition: {
        type: "ai",
        prompt: "User requests immediate specialist consultation"
      }
    },
    {
      from: "results_delivery",
      to: "assessment_completion",
      condition: {
        type: "ai",
        prompt: "Contact info collected and assessment delivery arranged"
      }
    },
    {
      from: "specialist_transfer",
      to: "assessment_completion", 
      condition: {
        type: "ai",
        prompt: "Call successfully transferred to specialist with full context"
      }
    }
  ]
};

function deployWorkflow() {
  const data = JSON.stringify(adaptiveWorkflow);
  
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
          console.log('✅ Adaptive Assessment WORKFLOW deployed successfully!');
          console.log('');
          console.log('🎯 Workflow ID:', result.id);
          console.log('📊 WORKFLOW STRUCTURE:');
          console.log('   🔍 Role Identification → Adaptive Routing');
          console.log('   👑 CTO/Technical Leadership Path');
          console.log('   💰 CFO/Financial Leadership Path'); 
          console.log('   👥 CHRO/People Leadership Path');
          console.log('   🏢 Department Manager Path');
          console.log('   🔧 Individual Contributor Path');
          console.log('   📈 Comprehensive Scoring & Analysis');
          console.log('   📋 Personalized Results Delivery');
          console.log('');
          console.log('🎨 ADAPTIVE FEATURES:');
          console.log('   • Dynamic role-based question routing');
          console.log('   • Department-specific pain point analysis');
          console.log('   • Authority-level appropriate recommendations');
          console.log('   • Role-specific tools and assessments');
          console.log('   • Personalized insights and roadmaps');
          console.log('');
          console.log('⏱️  Duration: 20-25 minutes (adaptive to role)');
          console.log('🎧 Voice: Enhanced 11Labs');
          console.log('📊 Results: Role-specific transformation roadmap');
          console.log('');
          console.log('🚀 TRUE WORKFLOW (not assistant) is now live!');
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

console.log('🚀 Deploying HumanGlue Adaptive Assessment WORKFLOW...');
console.log('');
deployWorkflow();