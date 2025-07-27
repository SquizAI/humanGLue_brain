// Enhanced HumanGlue Assessment Questions
// Based on 7-Layer Organizational Assessment Model

const enhancedDimensions = [
    {
        id: 'leadership',
        title: 'Leadership Psychology & Systems',
        description: 'Deep analysis of leadership effectiveness across cognitive, emotional, and systemic dimensions',
        agent: 'gpt-enhanced',
        toolboxCategory: 'Leadership & Management Development',
        layer: 'Leadership Systems Layer',
        questions: [
            {
                id: 'L1',
                text: 'How effectively do leaders demonstrate emotional regulation under pressure while maintaining team psychological safety?',
                type: 'likert',
                scale: 5,
                context: 'Emotional Intelligence & Psychological Safety',
                businessImpact: 'Team resilience and innovation capacity',
                psychologicalIndicator: 'Emotional regulation and safety creation',
                organizationalLevel: 'team',
                changeReadinessFactor: 'Leadership adaptability to stress'
            },
            {
                id: 'L2',
                text: 'To what degree do leaders consistently align their decision-making processes with stated organizational values?',
                type: 'likert',
                scale: 5,
                context: 'Values-Based Decision Making',
                businessImpact: 'Cultural integrity and trust building',
                psychologicalIndicator: 'Cognitive consistency and values integration',
                organizationalLevel: 'organizational',
                changeReadinessFactor: 'Values-driven change commitment'
            },
            {
                id: 'L3',
                text: 'How well do leaders demonstrate adaptive leadership behaviors when facing ambiguous or complex challenges?',
                type: 'likert',
                scale: 5,
                context: 'Adaptive Leadership Capacity',
                businessImpact: 'Innovation and change agility',
                psychologicalIndicator: 'Cognitive flexibility and tolerance for ambiguity',
                organizationalLevel: 'organizational',
                changeReadinessFactor: 'Adaptive capacity for transformation'
            },
            {
                id: 'L4',
                text: 'How effectively do leaders create conditions that enable others to experience autonomy and mastery in their roles?',
                type: 'likert',
                scale: 5,
                context: 'Empowerment & Development',
                businessImpact: 'Employee engagement and capability building',
                psychologicalIndicator: 'Motivation to develop others and share power',
                organizationalLevel: 'individual',
                changeReadinessFactor: 'Willingness to distribute authority'
            },
            {
                id: 'L5',
                text: 'To what extent do leaders demonstrate systems thinking when addressing organizational challenges?',
                type: 'likert',
                scale: 5,
                context: 'Systems Leadership',
                businessImpact: 'Strategic effectiveness and interconnected problem-solving',
                psychologicalIndicator: 'Systems thinking cognitive capacity',
                organizationalLevel: 'organizational',
                changeReadinessFactor: 'Holistic transformation perspective'
            }
        ]
    },
    {
        id: 'engagement',
        title: 'Employee Psychology & Motivation',
        description: 'Comprehensive analysis of motivation patterns, psychological needs fulfillment, and engagement drivers',
        agent: 'gemini-enhanced',
        toolboxCategory: 'Employee Experience & Engagement',
        layer: 'Individual Psychology Layer',
        questions: [
            {
                id: 'E1',
                text: 'How deeply do you feel your work contributes to a meaningful purpose that aligns with your personal values?',
                type: 'likert',
                scale: 5,
                context: 'Purpose-Values Alignment',
                businessImpact: 'Intrinsic motivation and sustained performance',
                psychologicalIndicator: 'Purpose fulfillment and values congruence',
                organizationalLevel: 'individual',
                changeReadinessFactor: 'Meaning-making capacity for change'
            },
            {
                id: 'E2',
                text: 'To what degree do you experience psychological safety to express ideas, concerns, or mistakes without fear?',
                type: 'likert',
                scale: 5,
                context: 'Psychological Safety',
                businessImpact: 'Innovation, learning, and collaboration quality',
                psychologicalIndicator: 'Trust levels and vulnerability tolerance',
                organizationalLevel: 'team',
                changeReadinessFactor: 'Safety to engage in change behaviors'
            },
            {
                id: 'E3',
                text: 'How effectively does your role provide opportunities for growth, mastery, and skill development?',
                type: 'likert',
                scale: 5,
                context: 'Growth & Mastery',
                businessImpact: 'Capability building and retention',
                psychologicalIndicator: 'Growth mindset and mastery orientation',
                organizationalLevel: 'individual',
                changeReadinessFactor: 'Learning orientation for adaptation'
            },
            {
                id: 'E4',
                text: 'How well do you feel recognized and appreciated for your unique contributions and efforts?',
                type: 'likert',
                scale: 5,
                context: 'Recognition & Appreciation',
                businessImpact: 'Motivation sustainability and discretionary effort',
                psychologicalIndicator: 'Self-worth and validation needs fulfillment',
                organizationalLevel: 'individual',
                changeReadinessFactor: 'Confidence to contribute to change'
            },
            {
                id: 'E5',
                text: 'How frequently do you experience flow states (deep engagement and optimal performance) in your work?',
                type: 'likert',
                scale: 5,
                context: 'Flow State Frequency',
                businessImpact: 'Peak performance and job satisfaction',
                psychologicalIndicator: 'Optimal experience and engagement depth',
                organizationalLevel: 'individual',
                changeReadinessFactor: 'Energy available for change engagement'
            }
        ]
    },
    {
        id: 'culture',
        title: 'Cultural Dynamics & Values Integration',
        description: 'Analysis of cultural coherence, behavioral norms, and values-behavior alignment patterns',
        agent: 'claude-enhanced',
        toolboxCategory: 'Culture & Values Integration',
        layer: 'Cultural Integration Layer',
        questions: [
            {
                id: 'C1',
                text: 'How consistently do observed behaviors throughout the organization reflect stated values and principles?',
                type: 'likert',
                scale: 5,
                context: 'Values-Behavior Alignment',
                businessImpact: 'Cultural authenticity and trust building',
                psychologicalIndicator: 'Cognitive dissonance levels and integrity',
                organizationalLevel: 'organizational',
                changeReadinessFactor: 'Cultural foundation for sustainable change'
            },
            {
                id: 'C2',
                text: 'To what extent do people feel a genuine sense of belonging and inclusion across diverse backgrounds?',
                type: 'likert',
                scale: 5,
                context: 'Belonging & Inclusion',
                businessImpact: 'Diversity effectiveness and talent retention',
                psychologicalIndicator: 'Social identity and inclusion experiences',
                organizationalLevel: 'team',
                changeReadinessFactor: 'Inclusive change participation'
            },
            {
                id: 'C3',
                text: 'How effectively does the organization maintain cultural coherence while adapting to change?',
                type: 'likert',
                scale: 5,
                context: 'Cultural Adaptability',
                businessImpact: 'Change resilience and identity preservation',
                psychologicalIndicator: 'Cultural flexibility and core identity strength',
                organizationalLevel: 'organizational',
                changeReadinessFactor: 'Cultural capacity for transformation'
            },
            {
                id: 'C4',
                text: 'How well do informal networks and relationships support positive cultural transmission?',
                type: 'likert',
                scale: 5,
                context: 'Social Network Dynamics',
                businessImpact: 'Cultural reinforcement and knowledge sharing',
                psychologicalIndicator: 'Social connection quality and influence patterns',
                organizationalLevel: 'team',
                changeReadinessFactor: 'Network support for change adoption'
            }
        ]
    },
    {
        id: 'communication',
        title: 'Communication Systems & Trust Dynamics',
        description: 'Assessment of information flow, dialogue quality, and trust-building communication patterns',
        agent: 'gemini-enhanced',
        toolboxCategory: 'Communication & Collaboration',
        layer: 'Interpersonal Dynamics Layer',
        questions: [
            {
                id: 'CM1',
                text: 'How effectively do communication patterns support mutual understanding and reduce misinterpretation?',
                type: 'likert',
                scale: 5,
                context: 'Communication Clarity & Understanding',
                businessImpact: 'Collaboration effectiveness and conflict reduction',
                psychologicalIndicator: 'Communication competence and empathy',
                organizationalLevel: 'team',
                changeReadinessFactor: 'Clear communication for change alignment'
            },
            {
                id: 'CM2',
                text: 'To what degree do people demonstrate active listening and seek to understand before being understood?',
                type: 'likert',
                scale: 5,
                context: 'Active Listening & Empathy',
                businessImpact: 'Relationship quality and problem-solving effectiveness',
                psychologicalIndicator: 'Empathic capacity and perspective-taking',
                organizationalLevel: 'individual',
                changeReadinessFactor: 'Openness to diverse change perspectives'
            },
            {
                id: 'CM3',
                text: 'How well does feedback flow bi-directionally to support learning and performance improvement?',
                type: 'likert',
                scale: 5,
                context: 'Feedback Systems',
                businessImpact: 'Learning acceleration and performance optimization',
                psychologicalIndicator: 'Feedback receptivity and growth orientation',
                organizationalLevel: 'team',
                changeReadinessFactor: 'Feedback-driven change adaptation'
            }
        ]
    },
    {
        id: 'innovation',
        title: 'Innovation Psychology & Creative Systems',
        description: 'Analysis of creative thinking patterns, experimentation mindset, and innovation-supporting structures',
        agent: 'gpt-enhanced',
        toolboxCategory: 'Innovation & Creativity',
        layer: 'Team Performance Layer',
        questions: [
            {
                id: 'I1',
                text: 'How effectively does the organization support psychological safety for creative risk-taking and experimentation?',
                type: 'likert',
                scale: 5,
                context: 'Creative Risk-Taking Safety',
                businessImpact: 'Innovation rate and competitive advantage',
                psychologicalIndicator: 'Risk tolerance and creative confidence',
                organizationalLevel: 'team',
                changeReadinessFactor: 'Experimentation mindset for change'
            },
            {
                id: 'I2',
                text: 'To what extent do people demonstrate curiosity and actively seek diverse perspectives for problem-solving?',
                type: 'likert',
                scale: 5,
                context: 'Curiosity & Perspective Diversity',
                businessImpact: 'Solution quality and breakthrough thinking',
                psychologicalIndicator: 'Intellectual curiosity and openness to experience',
                organizationalLevel: 'individual',
                changeReadinessFactor: 'Curiosity-driven change exploration'
            },
            {
                id: 'I3',
                text: 'How well do systems and processes support rapid prototyping and iterative learning?',
                type: 'likert',
                scale: 5,
                context: 'Iterative Learning Systems',
                businessImpact: 'Innovation speed and learning efficiency',
                psychologicalIndicator: 'Learning agility and adaptation speed',
                organizationalLevel: 'organizational',
                changeReadinessFactor: 'Rapid learning cycles for change'
            }
        ]
    },
    {
        id: 'agility',
        title: 'Organizational Agility & Change Readiness',
        description: 'Assessment of adaptation capacity, change resilience, and strategic responsiveness patterns',
        agent: 'claude-enhanced',
        toolboxCategory: 'Change Management & Transformation',
        layer: 'Strategic Alignment Layer',
        questions: [
            {
                id: 'A1',
                text: 'How quickly and effectively does the organization detect and respond to market or environmental changes?',
                type: 'likert',
                scale: 5,
                context: 'Environmental Sensing & Response',
                businessImpact: 'Market competitiveness and survival capacity',
                psychologicalIndicator: 'Environmental awareness and response agility',
                organizationalLevel: 'organizational',
                changeReadinessFactor: 'Proactive change anticipation'
            },
            {
                id: 'A2',
                text: 'To what degree do people demonstrate resilience and adaptability when facing unexpected challenges?',
                type: 'likert',
                scale: 5,
                context: 'Resilience & Adaptability',
                businessImpact: 'Crisis management and recovery speed',
                psychologicalIndicator: 'Resilience capacity and adaptation skills',
                organizationalLevel: 'individual',
                changeReadinessFactor: 'Personal resilience for change stress'
            },
            {
                id: 'A3',
                text: 'How effectively do decision-making processes balance speed with quality under changing conditions?',
                type: 'likert',
                scale: 5,
                context: 'Adaptive Decision-Making',
                businessImpact: 'Strategic agility and execution effectiveness',
                psychologicalIndicator: 'Decision-making under uncertainty',
                organizationalLevel: 'organizational',
                changeReadinessFactor: 'Decision agility for change navigation'
            }
        ]
    }
];

// Enhanced scoring interpretation
const enhancedScoringFramework = {
    dimensions: {
        leadership: {
            excellent: { min: 85, interpretation: "Advanced leadership psychology with strong systems thinking and emotional intelligence" },
            good: { min: 70, interpretation: "Solid leadership foundation with opportunities for psychological depth enhancement" },
            moderate: { min: 55, interpretation: "Basic leadership competence with significant development opportunities" },
            developing: { min: 40, interpretation: "Emerging leadership capacity requiring structured development intervention" },
            critical: { min: 0, interpretation: "Leadership effectiveness gaps requiring immediate attention and support" }
        },
        engagement: {
            excellent: { min: 85, interpretation: "High psychological engagement with optimal motivation patterns" },
            good: { min: 70, interpretation: "Strong engagement foundation with some motivation enhancement opportunities" },
            moderate: { min: 55, interpretation: "Moderate engagement levels with key psychological needs partially met" },
            developing: { min: 40, interpretation: "Engagement challenges with significant motivation gaps" },
            critical: { min: 0, interpretation: "Disengagement patterns requiring immediate intervention" }
        },
        culture: {
            excellent: { min: 85, interpretation: "Highly coherent culture with strong values-behavior alignment" },
            good: { min: 70, interpretation: "Solid cultural foundation with minor alignment improvements needed" },
            moderate: { min: 55, interpretation: "Cultural coherence present with some fragmentation" },
            developing: { min: 40, interpretation: "Cultural confusion with significant alignment needs" },
            critical: { min: 0, interpretation: "Cultural dysfunction requiring comprehensive intervention" }
        },
        communication: {
            excellent: { min: 85, interpretation: "Advanced communication systems supporting trust and understanding" },
            good: { min: 70, interpretation: "Effective communication with opportunities for deeper dialogue" },
            moderate: { min: 55, interpretation: "Basic communication functioning with clarity improvements needed" },
            developing: { min: 40, interpretation: "Communication gaps affecting collaboration and trust" },
            critical: { min: 0, interpretation: "Communication dysfunction requiring systematic intervention" }
        },
        innovation: {
            excellent: { min: 85, interpretation: "Thriving innovation culture with psychological safety for creativity" },
            good: { min: 70, interpretation: "Good innovation foundation with creative risk-taking opportunities" },
            moderate: { min: 55, interpretation: "Moderate innovation capacity with safety and process improvements needed" },
            developing: { min: 40, interpretation: "Innovation challenges with psychological and structural barriers" },
            critical: { min: 0, interpretation: "Innovation stagnation requiring cultural and systems transformation" }
        },
        agility: {
            excellent: { min: 85, interpretation: "High organizational agility with rapid adaptation capacity" },
            good: { min: 70, interpretation: "Good agility foundation with response speed opportunities" },
            moderate: { min: 55, interpretation: "Moderate agility with decision-making and sensing improvements needed" },
            developing: { min: 40, interpretation: "Agility limitations affecting responsiveness and adaptation" },
            critical: { min: 0, interpretation: "Agility dysfunction requiring comprehensive change capability building" }
        }
    }
};

// Enhanced intervention frameworks
const enhancedInterventions = {
    leadership: [
        {
            type: "Leadership Psychology Development",
            focus: "Emotional intelligence, systems thinking, and adaptive capacity",
            duration: "6-12 months",
            investment: "$75K-$125K",
            expectedImpact: "30-45% improvement in leadership effectiveness"
        },
        {
            type: "Values-Based Leadership Alignment",
            focus: "Decision-making frameworks and behavioral consistency",
            duration: "3-6 months", 
            investment: "$40K-$70K",
            expectedImpact: "25-35% improvement in trust and cultural integrity"
        }
    ],
    engagement: [
        {
            type: "Psychological Needs Fulfillment Program",
            focus: "Purpose, autonomy, mastery, and recognition systems",
            duration: "4-8 months",
            investment: "$50K-$90K",
            expectedImpact: "20-35% improvement in engagement scores"
        },
        {
            type: "Flow State Optimization",
            focus: "Role design and skill-challenge balance",
            duration: "3-6 months",
            investment: "$30K-$60K",
            expectedImpact: "15-25% improvement in performance and satisfaction"
        }
    ],
    culture: [
        {
            type: "Cultural Coherence Integration",
            focus: "Values-behavior alignment and belonging systems",
            duration: "6-12 months",
            investment: "$60K-$100K",
            expectedImpact: "25-40% improvement in cultural strength"
        }
    ],
    communication: [
        {
            type: "Trust-Building Communication Systems",
            focus: "Dialogue quality, active listening, and feedback loops",
            duration: "4-8 months",
            investment: "$35K-$65K",
            expectedImpact: "20-30% improvement in collaboration effectiveness"
        }
    ],
    innovation: [
        {
            type: "Creative Psychological Safety Development",
            focus: "Risk-taking support and experimentation systems",
            duration: "3-6 months",
            investment: "$45K-$80K",
            expectedImpact: "25-40% improvement in innovation rate"
        }
    ],
    agility: [
        {
            type: "Adaptive Capacity Building",
            focus: "Sensing systems, decision agility, and resilience",
            duration: "6-12 months",
            investment: "$70K-$120K",
            expectedImpact: "30-50% improvement in change responsiveness"
        }
    ]
}; 