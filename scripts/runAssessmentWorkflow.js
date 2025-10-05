#!/usr/bin/env node

/**
 * HumanGlue Comprehensive Assessment Workflow Deployment Script
 * 
 * This script deploys the comprehensive AI + Adaptability Maturity Assessment
 * workflow to Vapi, covering all dimensions specified in the requirements.
 */

require('dotenv').config();

class VapiWorkflowManager {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.vapi.ai';
  }

  async createWorkflow() {
    const workflow = {
      "name": "HumanGlue Comprehensive AI + Adaptability Assessment",
      "description": "Deep multi-dimensional assessment covering pain/urgency, people readiness, AI adoption, and organizational dynamics",
      "transcriber": {
        "provider": "deepgram",
        "model": "nova-3"
      },
      "voice": {
        "provider": "11labs",
        "voiceId": "90ipbRoKi4CpHXvKVtl0",
        "model": "eleven_turbo_v2_5"
      },
      "firstMessage": "Hello! I'm your HumanGlue AI transformation specialist. I'll be conducting our comprehensive AI + Adaptability Maturity Assessment - a deep dive into your organization's transformation readiness across multiple critical dimensions. This will take about 20-25 minutes and will give you unprecedented insights into your organization's transformation potential. Let's start with the most critical question: What will kill your business if you don't act? May I get your name, organization, and the biggest threat you're facing right now?",
      "systemMessage": `You are conducting the HumanGlue Comprehensive AI + Adaptability Maturity Assessment. This is a structured workflow covering these key phases:

## Phase 1: Pain & Urgency Assessment (5 minutes)
- Collect contact info and establish rapport
- Use assess_pain_urgency tool for immediate threats, competitive pressures, market disruption risks
- Assess strategic vision clarity and communication

## Phase 2: Budget vs Vision Reality (3 minutes)  
- Use assess_budget_reality tool for resource alignment, transformation pace, investment capacity
- Evaluate purpose/values alignment and cultural coherence

## Phase 3: People & Culture Deep Dive (8 minutes)
- Use assess_psychological_safety tool for trust, failure acceptance, innovation safety
- Use assess_conflict_workplace tool for conflict patterns, resolution effectiveness, productivity impact
- Use assess_intergenerational_dynamics tool for cross-generational collaboration and knowledge transfer
- Use assess_employee_churn_enps tool for retention patterns, eNPS, flight risk factors

## Phase 4: AI Adoption & Technical Readiness (5 minutes)
- Use assess_ai_adoption_patterns tool to map AI rockstars, learners, skeptics, resistors
- Use collect_assessment_data tool for technical infrastructure assessment
- Evaluate current AI tools, data quality, security readiness

## Phase 5: Comprehensive Analysis & Next Steps (4 minutes)
- Use calculate_maturity_score tool for overall readiness scoring
- Present pain vs readiness matrix positioning
- Provide transformation roadmap with quick wins and long-term strategy
- Use complete_assessment tool or transfer_to_specialist tool based on user preference

## Tool Usage Guidelines:
- Always use the appropriate assessment tool for each phase
- Capture numerical scores (1-10) whenever possible for quantitative analysis  
- Focus on actionable insights and specific examples
- Be efficient but thorough - this is a comprehensive diagnostic

## Communication Style:
- Professional, consultative, and results-focused
- Ask pointed questions that reveal real organizational dynamics
- Help them articulate pain points and transformation barriers
- Balance urgency with realistic expectations
- Position HumanGlue as the expert partner for their transformation journey

Your goal is to complete the most comprehensive transformation readiness assessment available, providing unprecedented insights into their organization's AI adoption potential.`,
      "tools": [
        {
          "type": "function",
          "function": {
            "name": "assess_pain_urgency",
            "description": "Analyzes immediate business threats, urgency levels, competitive pressures, and market disruption risks",
            "parameters": {
              "type": "object",
              "properties": {
                "immediateThreatLevel": {
                  "type": "string",
                  "description": "Level of immediate business threats (1-10 scale)"
                },
                "urgencyAssessment": {
                  "type": "string", 
                  "description": "How critical is transformation right now (not urgent/somewhat/very urgent/critical)"
                },
                "competitivePressure": {
                  "type": "string",
                  "description": "Competitive threats and who's moving faster (1-10 competitive threat level)"
                },
                "marketDisruptionRisk": {
                  "type": "string",
                  "description": "Vulnerability to market disruption (low/medium/high/severe)"
                },
                "timeToAct": {
                  "type": "string",
                  "description": "Estimated time window before threats become critical (months/years)"
                },
                "painPoints": {
                  "type": "string",
                  "description": "Top 3 most painful business challenges currently faced"
                }
              },
              "required": ["immediateThreatLevel", "urgencyAssessment", "competitivePressure", "marketDisruptionRisk"]
            }
          }
        },
        {
          "type": "function", 
          "function": {
            "name": "assess_budget_reality",
            "description": "Evaluates budget vs vision alignment, resource capacity, and transformation pace",
            "parameters": {
              "type": "object",
              "properties": {
                "budgetVisionAlignment": {
                  "type": "string",
                  "description": "How well budget matches transformation ambitions (1-10 scale)"
                },
                "resourceCapacity": {
                  "type": "string",
                  "description": "Available resources: budget, staff, time, technology, expertise (each rated 1-10)"
                },
                "transformationPace": {
                  "type": "string",
                  "description": "Realistic transformation pace (crawl/walk/run) based on resources"
                },
                "investmentCapacity": {
                  "type": "string",
                  "description": "Financial capacity for AI investment (limited/moderate/significant)"
                },
                "roiExpectations": {
                  "type": "string",
                  "description": "Expected ROI timeline and targets (months to see ROI, expected percentage)"
                }
              },
              "required": ["budgetVisionAlignment", "resourceCapacity", "transformationPace", "investmentCapacity"]
            }
          }
        },
        {
          "type": "function",
          "function": {
            "name": "assess_psychological_safety",
            "description": "Evaluates psychological safety including team trust, failure acceptance, and innovation safety",
            "parameters": {
              "type": "object",
              "properties": {
                "trustLevel": {
                  "type": "string",
                  "description": "Team trust levels - can people take risks without fear (1-10)"
                },
                "failureAcceptance": {
                  "type": "string",
                  "description": "How experimentation and failure are handled (punished/accepted/encouraged)"
                },
                "voiceInfluence": {
                  "type": "string", 
                  "description": "Do employees feel heard and valued in decision making (1-10)"
                },
                "innovationSafety": {
                  "type": "string",
                  "description": "Can teams propose radical ideas without career risk (1-10)"
                }
              },
              "required": ["trustLevel", "failureAcceptance", "voiceInfluence", "innovationSafety"]
            }
          }
        },
        {
          "type": "function",
          "function": {
            "name": "assess_conflict_workplace", 
            "description": "Assesses workplace conflict patterns, resolution capabilities, and productivity costs",
            "parameters": {
              "type": "object",
              "properties": {
                "conflictFrequency": {
                  "type": "string",
                  "description": "Frequency of workplace conflicts (daily/weekly/monthly/rarely)"
                },
                "conflictTypes": {
                  "type": "string",
                  "description": "Primary types of conflicts (personality/resource/leadership/communication)"
                },
                "resolutionTime": {
                  "type": "string",
                  "description": "Average time to resolve conflicts (hours/days/weeks/months)"
                },
                "productivityImpact": {
                  "type": "string",
                  "description": "Estimated productivity loss due to conflicts (percentage)"
                }
              },
              "required": ["conflictFrequency", "conflictTypes", "resolutionTime", "productivityImpact"]
            }
          }
        },
        {
          "type": "function",
          "function": {
            "name": "assess_intergenerational_dynamics",
            "description": "Evaluates cross-generational engagement and knowledge transfer effectiveness",
            "parameters": {
              "type": "object",
              "properties": {
                "crossGenEngagement": {
                  "type": "string",
                  "description": "Cross-generational engagement effectiveness (1-10)"
                },
                "knowledgeTransfer": {
                  "type": "string",
                  "description": "Knowledge transfer mechanisms and effectiveness (1-10)"
                },
                "digitalNativeVsTrad": {
                  "type": "string", 
                  "description": "Digital native vs traditional workforce dynamics (1-10 harmony)"
                },
                "collaborationPatterns": {
                  "type": "string",
                  "description": "Collaboration patterns across age groups (poor/fair/good/excellent)"
                }
              },
              "required": ["crossGenEngagement", "knowledgeTransfer", "digitalNativeVsTrad", "collaborationPatterns"]
            }
          }
        },
        {
          "type": "function",
          "function": {
            "name": "assess_employee_churn_enps",
            "description": "Analyzes employee turnover, costs, eNPS scores, and flight risk predictions",
            "parameters": {
              "type": "object",
              "properties": {
                "churnRate": {
                  "type": "string",
                  "description": "Annual employee turnover rate (percentage)"
                },
                "enpsScore": {
                  "type": "string",
                  "description": "Employee Net Promoter Score (-100 to +100)"
                },
                "flightRiskFactors": {
                  "type": "string",
                  "description": "Top factors contributing to employee departure"
                },
                "replacementCost": {
                  "type": "string",
                  "description": "Average cost to replace an employee (dollars or percentage of salary)"
                }
              },
              "required": ["churnRate", "enpsScore", "flightRiskFactors", "replacementCost"]
            }
          }
        },
        {
          "type": "function",
          "function": {
            "name": "assess_ai_adoption_patterns",
            "description": "Maps AI adoption patterns across rockstars, learners, skeptics, and resistors",
            "parameters": {
              "type": "object",
              "properties": {
                "aiRockstarsPercent": {
                  "type": "string",
                  "description": "Percentage of AI champions and early adopters (target 20%)"
                },
                "willingLearnersPercent": {
                  "type": "string",
                  "description": "Percentage open to AI with support (target 60%)"
                },
                "skepticsPercent": {
                  "type": "string",
                  "description": "Percentage needing convincing but convertible (target 15%)"
                },
                "currentToolUsage": {
                  "type": "string",
                  "description": "Current AI tool usage and proficiency levels (1-10)"
                }
              },
              "required": ["aiRockstarsPercent", "willingLearnersPercent", "skepticsPercent", "currentToolUsage"]
            }
          }
        },
        {
          "type": "function",
          "function": {
            "name": "collect_assessment_data",
            "description": "Collects technical infrastructure and general assessment responses",
            "parameters": {
              "type": "object", 
              "properties": {
                "response": {
                  "type": "string",
                  "description": "User's response to the question"
                },
                "questionId": {
                  "type": "string",
                  "description": "Unique identifier for the question"
                },
                "dimensionId": {
                  "type": "string",
                  "description": "Dimension category this question belongs to"
                },
                "parsedValue": {
                  "type": "string",
                  "description": "Parsed/normalized value from the response"
                },
                "responseType": {
                  "type": "string",
                  "description": "Type of response expected",
                  "enum": ["scale", "yes_no", "multiple_choice", "text"]
                }
              },
              "required": ["questionId", "dimensionId", "response", "responseType"]
            }
          }
        },
        {
          "type": "function",
          "function": {
            "name": "calculate_maturity_score",
            "description": "Calculates comprehensive AI maturity scores across all dimensions and categories",
            "parameters": {
              "type": "object",
              "properties": {
                "organizationId": {
                  "type": "string",
                  "description": "Organization identifier for score calculation"
                }
              },
              "required": ["organizationId"]
            }
          }
        },
        {
          "type": "function",
          "function": {
            "name": "complete_assessment",
            "description": "Completes the assessment and delivers final results and recommendations",
            "parameters": {
              "type": "object",
              "properties": {
                "organizationName": {
                  "type": "string",
                  "description": "Name of the organization assessed"
                },
                "contactEmail": {
                  "type": "string",
                  "description": "Email for report delivery"
                },
                "contactName": {
                  "type": "string",
                  "description": "Primary contact name"
                },
                "followUpPreferences": {
                  "type": "string",
                  "description": "Preferred follow-up method and timing"
                }
              },
              "required": ["organizationName", "contactEmail", "contactName"]
            }
          }
        },
        {
          "type": "function",
          "function": {
            "name": "transfer_to_specialist",
            "description": "Transfers the call to a human specialist for immediate consultation",
            "parameters": {
              "type": "object",
              "properties": {
                "urgencyLevel": {
                  "type": "string",
                  "description": "Urgency level for specialist transfer (low/medium/high/urgent)"
                },
                "summaryContext": {
                  "type": "string", 
                  "description": "Brief summary of assessment results for specialist context"
                }
              },
              "required": ["urgencyLevel"]
            }
          }
        }
      ]
    };

    try {
      const response = await fetch(`${this.baseUrl}/assistant`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workflow),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('❌ Failed to create workflow:', error);
      throw error;
    }
  }

  async testWorkflow(assistantId, phoneNumber) {
    const callRequest = {
      assistantId: assistantId,
      customer: {
        number: phoneNumber
      },
      assistantOverrides: {
        variableValues: {
          organizationId: `test-${Date.now()}`,
          contactName: "Test User",
          companyName: "Test Organization"
        }
      }
    };

    try {
      const response = await fetch(`${this.baseUrl}/call`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(callRequest),
      });

      if (!response.ok) {
        throw new Error(`Failed to initiate test call: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('❌ Failed to test workflow:', error);
      throw error;
    }
  }
}

async function main() {
  const apiKey = process.env.VAPI_API_KEY;
  if (!apiKey) {
    console.error('❌ VAPI_API_KEY environment variable is required');
    console.log('💡 Set your VAPI API key: export VAPI_API_KEY=your_key_here');
    process.exit(1);
  }

  const manager = new VapiWorkflowManager(apiKey);
  
  try {
    console.log('🚀 Deploying HumanGlue Comprehensive Assessment Workflow...');
    console.log('');
    
    const result = await manager.createWorkflow();
    
    console.log('✅ Comprehensive Assessment Workflow deployed successfully!');
    console.log('');
    console.log('📊 ASSESSMENT COVERAGE:');
    console.log('   🔥 Pain Scale Analysis - What Will Kill Us?');
    console.log('   💰 Budget vs Vision Reality Check');
    console.log('   🧠 Psychological Safety Assessment');
    console.log('   ⚔️ Workplace Conflict Analysis');
    console.log('   👥 Intergenerational Dynamics');
    console.log('   💔 Employee Churn & eNPS Analysis');
    console.log('   🤖 AI Adoption Patterns Mapping');
    console.log('   🎯 Comprehensive Maturity Scoring');
    console.log('');
    console.log('🎯 Assistant ID:', result.id);
    console.log('🔗 Webhook URL: https://humanglue-voice-webhook.netlify.app/.netlify/functions/');
    console.log('⏱️  Assessment Duration: 20-25 minutes');
    console.log('📞 Phone Integration: Ready for outbound/inbound calls');
    console.log('');
    console.log('🎉 Your comprehensive AI + Adaptability Assessment is now live!');
    
    // Test call if phone number provided
    const testPhoneNumber = process.env.TEST_PHONE_NUMBER;
    if (testPhoneNumber) {
      console.log('');
      console.log('📱 Initiating test call...');
      const testResult = await manager.testWorkflow(result.id, testPhoneNumber);
      console.log('✅ Test call initiated! Call ID:', testResult.id);
    }
    
  } catch (error) {
    console.error('💥 Deployment failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}