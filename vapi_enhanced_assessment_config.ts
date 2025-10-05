/**
 * Enhanced 23-Dimension Assessment Configuration for VAPI
 * Implements adaptive questioning, real-time scoring, and role-based paths
 */

import { AssessmentDimension, VapiAssessmentConfig } from './types';

export const ENHANCED_ASSESSMENT_CONFIG: VapiAssessmentConfig = {
  metadata: {
    version: '2.0',
    name: 'HumanGlue 23-Dimension AI Maturity Assessment',
    duration: '25-35 minutes',
    dimensions: 23,
    adaptiveQuestions: true,
    realTimeScoring: true
  },

  // Initial classifier questions to route assessment
  classifierQuestions: [
    {
      id: 'CLASSIFY_ROLE',
      text: "Welcome! I'm here to understand your AI transformation journey. Let's start with you - what's your role in the organization?",
      responseProcessing: {
        keywords: {
          'CEO|chief executive': 'CEO_PATH',
          'COO|operations': 'COO_PATH',
          'CFO|finance|financial': 'CFO_PATH',
          'CTO|technology': 'CTO_PATH',
          'CHRO|HR|human resources': 'CHRO_PATH',
          'CMO|marketing': 'CMO_PATH',
          'CIO|innovation': 'CIO_PATH',
          'CSO|strategy': 'CSO_PATH',
          'CAIO|AI officer': 'CAIO_PATH',
          'director|head|lead': 'DEPARTMENT_HEAD_PATH'
        }
      }
    },
    {
      id: 'CLASSIFY_MATURITY',
      text: "How would you describe your organization's relationship with AI today - are you just getting started, actively using it, or leading with it?",
      responseProcessing: {
        maturityLevel: {
          'just getting started|exploring|beginning': 'FOUNDATIONAL',
          'actively using|implementing|deploying': 'OPERATIONAL',
          'leading|transforming|pioneering': 'STRATEGIC'
        }
      }
    },
    {
      id: 'CLASSIFY_PRIORITY',
      text: "What's your biggest priority right now - improving efficiency, driving innovation, or transforming the business?",
      responseProcessing: {
        focus: {
          'efficiency|automation|cost': 'OPERATIONAL_FOCUS',
          'innovation|new|creative': 'INNOVATION_FOCUS',
          'transform|disrupt|reinvent': 'TRANSFORMATION_FOCUS'
        }
      }
    }
  ],

  // Dimension configurations with adaptive questioning
  dimensions: {
    // TECHNICAL INFRASTRUCTURE (5 dimensions)
    DATA_INFRASTRUCTURE: {
      id: 'DATA_INFRASTRUCTURE',
      name: 'Data Infrastructure & Quality',
      category: 'Technical',
      weight: 0.08,
      questions: {
        safety: [
          {
            id: 'DATA_S1',
            text: "Walk me through how data moves through your organization today. Where does it live and who can access it?",
            followUps: {
              lowDetail: "Can you give me a specific example?",
              highDetail: "What frustrates you most about that?"
            },
            scoring: {
              keywords: {
                positive: ['integrated', 'real-time', 'governed', 'quality', 'accessible'],
                negative: ['silos', 'manual', 'inconsistent', 'delayed', 'unclear']
              }
            }
          }
        ],
        challenge: [
          {
            id: 'DATA_C1',
            text: "If you could see any data in real-time right now to make better decisions, what would it be?",
            followUps: {
              specific: "What's stopping you from having that visibility today?",
              vague: "Can you think of a specific decision that would improve?"
            }
          }
        ],
        transformation: [
          {
            id: 'DATA_T1',
            text: "Imagine your data could predict problems before they happen. What would you want it to predict first?",
            followUps: {
              operational: "How would that change your operations?",
              strategic: "How would that change your business model?"
            }
          }
        ]
      }
    },

    SYSTEMS_INTEGRATION: {
      id: 'SYSTEMS_INTEGRATION',
      name: 'Systems Integration & APIs',
      category: 'Technical',
      weight: 0.06,
      questions: {
        safety: [
          {
            id: 'SYSTEMS_S1',
            text: "How many different systems do you log into on a typical day? Walk me through them.",
            followUps: {
              many: "Which ones talk to each other?",
              few: "Are those systems integrated?"
            }
          }
        ],
        challenge: [
          {
            id: 'SYSTEMS_C1',
            text: "If all your systems could share data instantly, what would become possible that isn't today?",
            scoring: {
              maturityIndicators: {
                low: ['not sure', "don't know", 'maybe'],
                medium: ['efficiency', 'automation', 'faster'],
                high: ['new capabilities', 'transformation', 'unprecedented']
              }
            }
          }
        ]
      }
    },

    // ... Continue for all 23 dimensions
  },

  // Role-based assessment paths
  assessmentPaths: {
    CEO_PATH: {
      focusDimensions: [
        'MARKET_INTELLIGENCE',
        'FINANCIAL_MANAGEMENT',
        'ORGANIZATIONAL_ALIGNMENT',
        'LEADERSHIP_READINESS',
        'TRANSFORMATION_READINESS'
      ],
      questionDepth: {
        strategic: 'high',
        operational: 'medium',
        technical: 'low'
      },
      timeAllocation: {
        vision: '40%',
        execution: '30%',
        measurement: '30%'
      }
    },

    CTO_PATH: {
      focusDimensions: [
        'DATA_INFRASTRUCTURE',
        'SYSTEMS_INTEGRATION',
        'CLOUD_EDGE_COMPUTING',
        'DEVELOPMENT_OPERATIONS',
        'SECURITY_COMPLIANCE'
      ],
      questionDepth: {
        strategic: 'medium',
        operational: 'high',
        technical: 'high'
      }
    },

    // Additional paths for all roles...
  },

  // Adaptive questioning logic
  adaptiveLogic: {
    skipRules: [
      {
        condition: 'maturityScore > 7',
        action: 'skipSafetyQuestions',
        reason: 'High maturity detected - focusing on transformation'
      },
      {
        condition: 'responseTime < 2 seconds',
        action: 'addClarificationQuestion',
        reason: 'Quick response may lack depth'
      },
      {
        condition: 'uncertaintyDetected',
        action: 'provideExample',
        reason: 'User seems unsure - providing context'
      }
    ],

    depthAdjustment: [
      {
        trigger: 'detailedResponse',
        action: 'askFollowUp',
        prompt: "That's insightful. Can you tell me more about [SPECIFIC_ASPECT]?"
      },
      {
        trigger: 'shortResponse',
        action: 'promptElaboration',
        prompt: "Interesting. Can you give me a specific example?"
      }
    ],

    energyManagement: [
      {
        checkpoint: 'every15Questions',
        action: 'energyCheck',
        prompt: "Great insights so far! How are you feeling about our conversation? Ready to explore [NEXT_AREA]?"
      },
      {
        checkpoint: 'lowEngagement',
        action: 'reEnergize',
        prompt: "I'm noticing some valuable patterns in what you're sharing. This is really helpful for creating targeted recommendations."
      }
    ]
  },

  // Real-time scoring configuration
  scoringEngine: {
    responseAnalysis: {
      sentimentWeight: 0.15,
      specificityWeight: 0.35,
      sophisticationWeight: 0.30,
      scopeWeight: 0.20
    },

    maturityIndicators: {
      level_0_1: {
        patterns: ['we don\\'t', 'not yet', 'haven\\'t started', 'not sure'],
        sentiment: 'negative|neutral',
        specificity: 'low'
      },
      level_2_3: {
        patterns: ['exploring', 'starting to', 'some teams', 'piloting'],
        sentiment: 'neutral|positive',
        specificity: 'medium'
      },
      level_4_5: {
        patterns: ['implemented', 'using across', 'measuring', 'integrated'],
        sentiment: 'positive',
        specificity: 'high',
        evidence: 'required'
      },
      level_6_7: {
        patterns: ['optimized', 'scaled', 'ROI positive', 'transformed'],
        metrics: 'required',
        scope: 'organizational'
      },
      level_8_10: {
        patterns: ['leading', 'pioneering', 'others learn from us', 'industry first'],
        evidence: 'external validation',
        scope: 'market'
      }
    },

    aggregation: {
      dimensionScore: 'weightedAverage',
      categoryScore: {
        technical: 0.25,
        business: 0.30,
        human: 0.20,
        governance: 0.15,
        crossFunctional: 0.10
      },
      confidence: {
        '3-5 questions': 0.70,
        '6-8 questions': 0.85,
        '9+ questions': 0.95
      }
    }
  },

  // Conversation management
  conversationFlow: {
    transitions: {
      smooth: [
        "That's helpful context about {PREVIOUS}. Now let's explore {NEXT}...",
        "Building on what you just shared, I'm curious about {RELATED}...",
        "Great insights on {TOPIC}. This connects nicely to {NEXT_TOPIC}..."
      ],
      energizing: [
        "You're painting a really clear picture here...",
        "This is exactly the kind of insight that helps us create targeted recommendations...",
        "I can see why that's important to you. Tell me more..."
      ]
    },

    validation: {
      patterns: [
        "Let me make sure I understand - you're saying {SUMMARY}?",
        "So if I'm hearing correctly, {KEY_POINT}?",
        "That's interesting because it suggests {INSIGHT}..."
      ]
    },

    closure: {
      domainComplete: "Excellent insights on {DOMAIN}. You've given me a clear picture of {KEY_STRENGTH} and {KEY_OPPORTUNITY}.",
      assessmentComplete: "This has been incredibly valuable. Based on our conversation, I'm seeing three key themes: {THEME1}, {THEME2}, and {THEME3}."
    }
  },

  // Output configuration
  outputGeneration: {
    realTime: {
      enabled: true,
      updates: ['afterEachDimension', 'significantInsight', 'completionMilestone']
    },
    
    reports: {
      executive: {
        timeline: '24 hours',
        sections: ['maturityScore', 'top3Opportunities', 'top3Risks', 'quickWins', 'investment']
      },
      comprehensive: {
        timeline: '48 hours',
        sections: ['23dimensionAnalysis', 'gapAnalysis', 'transformationRoadmap', 'roleSpecificPlans']
      },
      technical: {
        timeline: '72 hours',
        sections: ['architectureRecommendations', 'vendorAnalysis', 'implementationGuide']
      }
    }
  },

  // VAPI-specific configuration
  vapiIntegration: {
    model: 'gpt-4-turbo',
    temperature: 0.7,
    maxTokens: 150,
    
    voice: {
      provider: '11labs',
      voiceId: 'sarah',
      speed: 1.0,
      emotion: 'professional-warm'
    },

    transcription: {
      provider: 'deepgram',
      model: 'nova-2',
      language: 'en',
      features: ['punctuation', 'sentiment', 'topics']
    },

    interruption: {
      enabled: true,
      threshold: 0.5,
      gracefulHandling: true
    },

    silence: {
      thinkingPauseMs: 3000,
      completionPauseMs: 1000,
      promptAfterSilence: "Take your time. This is important to get right."
    },

    errorHandling: {
      networkError: "I'm having a slight connection issue. Let me repeat that...",
      comprehensionError: "I want to make sure I understand correctly. Could you rephrase that?",
      scoringError: "Let me think about that response for a moment..."
    }
  }
};

// Helper functions for dynamic assessment management
export const assessmentHelpers = {
  selectPath: (role: string, maturity: string, priority: string) => {
    // Logic to select optimal path based on classifiers
  },

  calculateScore: (responses: any[], dimension: string) => {
    // Scoring logic implementation
  },

  generateFollowUp: (response: string, context: any) => {
    // Dynamic follow-up generation
  },

  checkEnergy: (conversationMetrics: any) => {
    // Energy level detection and management
  },

  synthesizeInsights: (dimensionScores: any) => {
    // Pattern recognition and insight generation
  }
};

// Export for use in VAPI webhook
export default ENHANCED_ASSESSMENT_CONFIG;