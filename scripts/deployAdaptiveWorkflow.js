#!/usr/bin/env node

const https = require('https');

const VAPI_API_KEY = process.env.VAPI_API_KEY;

// Adaptive workflow definition
const adaptiveWorkflow = {
  name: "HumanGlue Adaptive AI Assessment",
  description: "Role-based comprehensive AI transformation assessment that adapts based on caller's position and department",
  transcriber: {
    provider: "deepgram",
    model: "nova-3"
  },
  voice: {
    provider: "11labs", 
    voiceId: "90ipbRoKi4CpHXvKVtl0",
    model: "eleven_turbo_v2_5"
  },
  firstMessage: "Hello! I'm your HumanGlue AI transformation specialist. I'll conduct a personalized AI assessment tailored specifically to your role and responsibilities. This comprehensive evaluation will provide insights directly relevant to your position and department. To customize this assessment for maximum value, may I get your name, job title, department, and what level of decision-making authority you have regarding technology and transformation initiatives?",
  systemMessage: `You are conducting the HumanGlue Adaptive AI + Adaptability Assessment. This assessment dynamically customizes based on the caller's:

## ROLE IDENTIFICATION (First 3 minutes):
1. **Capture Role Information** using identify_role_department tool:
   - Role level: C-Suite, VP, Director, Manager, Individual Contributor
   - Department: IT, HR, Finance, Operations, Sales, Marketing, R&D, etc.
   - Job title and specific responsibilities
   - Decision authority: Budget Owner, Strong Influencer, Stakeholder, Implementer, End User
   - Team size and years in role
   - Primary role-specific concerns

## ADAPTIVE ASSESSMENT PATHS:

### CTO/IT LEADERSHIP PATH (use assess_cto_technical_perspective):
- Technology stack modernity and AI-readiness
- Technical team capabilities and skills gaps
- Data architecture and infrastructure maturity
- Vendor ecosystem and security compliance
- Implementation challenges and technical roadmap

### CFO/FINANCE LEADERSHIP PATH (use assess_cfo_financial_perspective):
- ROI expectations and budget allocation
- Risk tolerance and payback period analysis
- Cost optimization opportunities
- Financial metrics and competitive advantage
- Investment strategy and business case development

### CHRO/HR LEADERSHIP PATH (use assess_chro_people_perspective):
- Workforce readiness and change management
- Talent strategy and skills gaps
- Cultural barriers and employee engagement
- Leadership alignment and diversity considerations
- People transformation strategy

### DEPARTMENT MANAGER PATH (use assess_department_manager_perspective):
- Team dynamics and operational challenges
- Implementation concerns and resource needs
- Training requirements and performance metrics
- Stakeholder buy-in and department priorities
- Ground-level implementation realities

### INDIVIDUAL CONTRIBUTOR PATH:
- Personal AI tool comfort and adoption
- Role-specific automation opportunities
- Skills development and training needs
- Career impact and professional development
- User experience and implementation support

## ASSESSMENT FLOW:
1. **Role Identification** (3 min) → Route to appropriate path
2. **Role-Specific Deep Dive** (12-15 min) → Customized questions and tools
3. **Supplementary Analysis** (5-7 min) → Fill gaps with relevant general tools
4. **Personalized Scoring** (3-4 min) → Role-specific insights and roadmap
5. **Customized Results** (2-3 min) → Tailored recommendations and next steps

## TOOL USAGE STRATEGY:
- **Always start** with identify_role_department tool
- **Route to role-specific tools** based on identification
- **Supplement** with general assessment tools as relevant
- **Customize questions** based on their authority level and concerns
- **Focus on their sphere of influence** and decision-making scope

## COMMUNICATION APPROACH:
- **Speak their language**: Technical with CTOs, financial with CFOs, people-focused with CHROs
- **Address their pain points**: Role-specific challenges and pressures
- **Provide relevant recommendations**: Actionable within their authority level
- **Respect their expertise**: Ask informed questions appropriate to their role
- **Focus on their success metrics**: How they measure success in their position

Your goal is to provide the most relevant, personalized AI transformation assessment possible, delivering insights they can act on within their specific role and authority level.`,
  tools: [
    {
      type: "function",
      function: {
        name: "identify_role_department",
        description: "Identifies caller's role, department, decision authority and customizes assessment path",
        parameters: {
          type: "object",
          properties: {
            roleLevel: {
              type: "string",
              description: "Leadership level (C-Suite/VP/Director/Manager/Individual Contributor)",
              enum: ["C-Suite", "VP", "Director", "Manager", "Individual Contributor"]
            },
            department: {
              type: "string", 
              description: "Primary department/function",
              enum: ["IT", "HR", "Finance", "Operations", "Sales", "Marketing", "R&D", "Legal", "Customer Success", "Product", "Executive", "Other"]
            },
            jobTitle: {
              type: "string",
              description: "Specific job title and role"
            },
            decisionAuthority: {
              type: "string",
              description: "Decision-making authority level",
              enum: ["Budget Owner", "Strong Influencer", "Stakeholder", "Implementer", "End User"]
            },
            teamSize: {
              type: "string", 
              description: "Number of people they manage or influence"
            },
            primaryConcerns: {
              type: "string",
              description: "Top 3 concerns related to their specific role and department"
            }
          },
          required: ["roleLevel", "department", "jobTitle", "decisionAuthority"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "assess_cto_technical_perspective", 
        description: "CTO/IT Leadership assessment covering technical infrastructure and team capabilities",
        parameters: {
          type: "object",
          properties: {
            techStackModernity: {
              type: "string",
              description: "Current technology stack modernity and AI-readiness (1-10)"
            },
            teamTechnicalSkills: {
              type: "string",
              description: "Technical team AI/ML capabilities and skills gaps"
            },
            dataArchitecture: {
              type: "string", 
              description: "Data architecture maturity for AI implementation (1-10)"
            },
            implementationChallenges: {
              type: "string",
              description: "Biggest technical challenges for AI implementation"
            }
          },
          required: ["techStackModernity", "teamTechnicalSkills", "dataArchitecture", "implementationChallenges"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "assess_cfo_financial_perspective",
        description: "CFO/Finance Leadership assessment covering ROI expectations and budget planning",
        parameters: {
          type: "object",
          properties: {
            roiExpectations: {
              type: "string",
              description: "Expected ROI timeline and financial targets for AI investment"
            },
            budgetAllocation: {
              type: "string",
              description: "Current and planned budget allocation for AI initiatives"
            },
            riskTolerance: {
              type: "string",
              description: "Risk tolerance for AI investments and new technology adoption"
            },
            paybackPeriod: {
              type: "string",
              description: "Expected payback period for AI investments (months/years)"
            }
          },
          required: ["roiExpectations", "budgetAllocation", "riskTolerance", "paybackPeriod"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "assess_chro_people_perspective",
        description: "CHRO/HR Leadership assessment covering workforce readiness and cultural transformation",
        parameters: {
          type: "object",
          properties: {
            workforceReadiness: {
              type: "string",
              description: "Employee readiness for AI adoption and digital transformation (1-10)"
            },
            changeManagement: {
              type: "string",
              description: "Change management capabilities and historical success rate"
            },
            talentStrategy: {
              type: "string",
              description: "Talent acquisition and retention strategy for AI-enabled workforce"
            },
            skillsGaps: {
              type: "string",
              description: "Critical skills gaps and training needs across the organization"
            }
          },
          required: ["workforceReadiness", "changeManagement", "talentStrategy", "skillsGaps"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "assess_department_manager_perspective",
        description: "Department Manager assessment covering team dynamics and operational challenges",
        parameters: {
          type: "object",
          properties: {
            teamDynamics: {
              type: "string",
              description: "Current team collaboration and AI readiness within department"
            },
            operationalChallenges: {
              type: "string",
              description: "Day-to-day operational challenges that AI could address"
            },
            implementationConcerns: {
              type: "string",
              description: "Concerns about AI implementation impact on team and workflows"
            },
            resourceNeeds: {
              type: "string",
              description: "Resources needed to support AI adoption in department"
            }
          },
          required: ["teamDynamics", "operationalChallenges", "implementationConcerns", "resourceNeeds"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "assess_pain_urgency",
        description: "Analyzes business threats, urgency levels, and competitive pressures",
        parameters: {
          type: "object",
          properties: {
            immediateThreatLevel: {
              type: "string",
              description: "Level of immediate business threats (1-10 scale)"
            },
            urgencyAssessment: {
              type: "string",
              description: "How critical is transformation right now (not urgent/somewhat/very urgent/critical)"
            },
            competitivePressure: {
              type: "string",
              description: "Competitive threats and who's moving faster (1-10 competitive threat level)"
            },
            marketDisruptionRisk: {
              type: "string",
              description: "Vulnerability to market disruption (low/medium/high/severe)"
            }
          },
          required: ["immediateThreatLevel", "urgencyAssessment", "competitivePressure", "marketDisruptionRisk"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "calculate_maturity_score",
        description: "Calculates comprehensive AI maturity scores and generates personalized recommendations",
        parameters: {
          type: "object",
          properties: {
            organizationId: {
              type: "string",
              description: "Organization identifier for score calculation"
            },
            roleLevel: {
              type: "string", 
              description: "Role level for personalized scoring"
            },
            department: {
              type: "string",
              description: "Department for customized recommendations"
            }
          },
          required: ["organizationId"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "complete_assessment",
        description: "Completes assessment and delivers role-specific results",
        parameters: {
          type: "object",
          properties: {
            organizationName: {
              type: "string",
              description: "Name of the organization assessed"
            },
            contactEmail: {
              type: "string",
              description: "Email for report delivery"
            },
            contactName: {
              type: "string",
              description: "Primary contact name"
            },
            roleSpecificInsights: {
              type: "string",
              description: "Role-specific insights and recommendations"
            }
          },
          required: ["organizationName", "contactEmail", "contactName"]
        }
      }
    }
  ]
};

function deployWorkflow() {
  const data = JSON.stringify(adaptiveWorkflow);
  
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
          console.log('✅ Adaptive Assessment Workflow deployed successfully!');
          console.log('');
          console.log('🎯 Assistant ID:', result.id);
          console.log('📱 Workflow Features:');
          console.log('   🔍 Dynamic Role Identification');
          console.log('   👑 CTO/IT Leadership Path');
          console.log('   💰 CFO/Finance Leadership Path'); 
          console.log('   👥 CHRO/HR Leadership Path');
          console.log('   🏢 Department Manager Path');
          console.log('   🔧 Individual Contributor Path');
          console.log('');
          console.log('🎨 PERSONALIZATION:');
          console.log('   • Questions adapt to role & authority level');
          console.log('   • Department-specific pain point analysis');
          console.log('   • Customized recommendations within their scope');
          console.log('   • Role-appropriate language and metrics');
          console.log('');
          console.log('⏱️  Duration: 20-25 minutes (adaptive)');
          console.log('🎧 Voice: Enhanced 11Labs');
          console.log('📊 Results: Role-specific insights & roadmap');
          console.log('');
          console.log('🚀 Ready for personalized assessments!');
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

console.log('🚀 Deploying HumanGlue Adaptive AI Assessment Workflow...');
console.log('');
deployWorkflow();