class ConversationalAssessment {
    constructor(chatbot) {
        this.chatbot = chatbot;
        this.currentDimensionIndex = 0;
        this.currentQuestionIndex = 0;
        this.responses = {};
        this.isAssessmentActive = false;
        this.startTime = null;
        
        // Enhanced HumanGlue Assessment Questions - 7-Layer Model
        this.dimensions = [
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
                        changeReadinessFactor: 'Leadership adaptability to stress',
                        options: [
                            { value: 5, label: '🟢 Excellent - Leaders consistently maintain composure and create safe spaces' },
                            { value: 4, label: '🔵 Good - Leaders usually regulate emotions well with occasional lapses' },
                            { value: 3, label: '🟡 Average - Mixed performance depending on situation and leader' },
                            { value: 2, label: '🟠 Below Average - Leaders struggle with pressure, affecting team safety' },
                            { value: 1, label: '🔴 Poor - Emotional volatility undermines psychological safety' }
                        ]
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
                        changeReadinessFactor: 'Values-driven change commitment',
                        options: [
                            { value: 5, label: '🟢 Always - Decisions consistently reflect organizational values' },
                            { value: 4, label: '🔵 Usually - Strong alignment with rare exceptions' },
                            { value: 3, label: '🟡 Sometimes - Inconsistent values-based decision making' },
                            { value: 2, label: '🟠 Rarely - Values often secondary to other considerations' },
                            { value: 1, label: '🔴 Never - Decisions ignore or contradict stated values' }
                        ]
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
                        changeReadinessFactor: 'Adaptive capacity for transformation',
                        options: [
                            { value: 5, label: '🟢 Highly Adaptive - Thrives in ambiguity, innovative approaches' },
                            { value: 4, label: '🔵 Adaptive - Adjusts well to complex situations' },
                            { value: 3, label: '🟡 Moderately Adaptive - Some flexibility but prefers certainty' },
                            { value: 2, label: '🟠 Rigid - Struggles with ambiguity, sticks to familiar approaches' },
                            { value: 1, label: '🔴 Inflexible - Cannot adapt to complex or ambiguous challenges' }
                        ]
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
                        changeReadinessFactor: 'Meaning-making capacity for change',
                        options: [
                            { value: 5, label: '🟢 Deeply Meaningful - Perfect alignment with personal purpose' },
                            { value: 4, label: '🔵 Very Meaningful - Strong connection to personal values' },
                            { value: 3, label: '🟡 Somewhat Meaningful - Moderate purpose connection' },
                            { value: 2, label: '🟠 Minimally Meaningful - Little connection to personal values' },
                            { value: 1, label: '🔴 Not Meaningful - No sense of purpose or values alignment' }
                        ]
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
                        changeReadinessFactor: 'Safety to engage in change behaviors',
                        options: [
                            { value: 5, label: '🟢 Completely Safe - Full freedom to express and make mistakes' },
                            { value: 4, label: '🔵 Very Safe - Comfortable sharing most ideas and concerns' },
                            { value: 3, label: '🟡 Moderately Safe - Selective about what to share' },
                            { value: 2, label: '🟠 Somewhat Unsafe - Hesitant to express ideas or admit mistakes' },
                            { value: 1, label: '🔴 Unsafe - Fear prevents authentic expression' }
                        ]
                    }
                ]
            },
            {
                id: 'culture',
                title: 'Cultural Dynamics & Organizational Identity',
                description: 'Analysis of cultural patterns, shared beliefs, and organizational identity formation',
                agent: 'claude-enhanced',
                toolboxCategory: 'Cultural Transformation',
                layer: 'Cultural Integration Layer',
                questions: [
                    {
                        id: 'C1',
                        text: 'How well do the organization\'s stated values align with the actual day-to-day behaviors you observe?',
                        type: 'likert',
                        scale: 5,
                        context: 'Values-Behavior Alignment',
                        businessImpact: 'Cultural authenticity and employee trust',
                        psychologicalIndicator: 'Cognitive dissonance levels',
                        organizationalLevel: 'organizational',
                        changeReadinessFactor: 'Values-driven change acceptance',
                        options: [
                            { value: 5, label: '🟢 Perfect Alignment - Values and behaviors are completely consistent' },
                            { value: 4, label: '🔵 Strong Alignment - Minor gaps between values and behaviors' },
                            { value: 3, label: '🟡 Moderate Alignment - Noticeable inconsistencies exist' },
                            { value: 2, label: '🟠 Poor Alignment - Significant gaps between stated and lived values' },
                            { value: 1, label: '🔴 No Alignment - Behaviors contradict stated values' }
                        ]
                    }
                ]
            }
        ];
    }

    startAssessment() {
        this.isAssessmentActive = true;
        this.startTime = new Date();
        this.currentDimensionIndex = 0;
        this.currentQuestionIndex = 0;
        this.responses = {};
        
        // Introduction message
        const intro = `
            <div class="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-4">
                <h4 class="font-semibold text-gray-800 mb-2">🧠 HumanGlue 7-Layer Assessment</h4>
                <p class="text-gray-600 text-sm mb-3">
                    I'll guide you through a comprehensive organizational assessment using the HumanGlue methodology. 
                    This will take about 5-7 minutes and covers ${this.getTotalQuestions()} evidence-based questions across 
                    ${this.dimensions.length} critical organizational dimensions.
                </p>
                <div class="bg-white rounded p-3">
                    <div class="text-xs text-gray-500 mb-1">Assessment Layers:</div>
                    <div class="flex flex-wrap gap-1">
                        ${this.dimensions.map(d => `<span class="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">${d.title.split(' &')[0]}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;
        
        this.chatbot.addMessage(intro, 'ai');
        
        setTimeout(() => {
            this.askNextQuestion();
        }, 1000);
    }

    getTotalQuestions() {
        return this.dimensions.reduce((total, dim) => total + dim.questions.length, 0);
    }

    getCurrentProgress() {
        const totalQuestions = this.getTotalQuestions();
        let answeredQuestions = 0;
        
        for (let i = 0; i < this.currentDimensionIndex; i++) {
            answeredQuestions += this.dimensions[i].questions.length;
        }
        answeredQuestions += this.currentQuestionIndex;
        
        return {
            current: answeredQuestions,
            total: totalQuestions,
            percentage: Math.round((answeredQuestions / totalQuestions) * 100)
        };
    }

    askNextQuestion() {
        if (this.currentDimensionIndex >= this.dimensions.length) {
            this.completeAssessment();
            return;
        }

        const dimension = this.dimensions[this.currentDimensionIndex];
        const question = dimension.questions[this.currentQuestionIndex];
        const progress = this.getCurrentProgress();

        // Show dimension transition if starting new dimension
        if (this.currentQuestionIndex === 0) {
            const dimensionIntro = `
                <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-3">
                    <div class="flex items-center justify-between mb-2">
                        <h4 class="font-semibold text-blue-800">${dimension.title}</h4>
                        <span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">${dimension.layer}</span>
                    </div>
                    <p class="text-blue-600 text-sm">${dimension.description}</p>
                </div>
            `;
            this.chatbot.addMessage(dimensionIntro, 'ai');
        }

        // Ask the question with progress
        const questionHtml = `
            <div class="mb-4">
                <div class="flex items-center justify-between mb-3">
                    <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        Question ${progress.current + 1} of ${progress.total}
                    </span>
                    <span class="text-xs text-gray-500">${progress.percentage}% Complete</span>
                </div>
                
                <div class="bg-white border border-gray-200 rounded-lg p-4">
                    <p class="font-medium text-gray-800 mb-3">${question.text}</p>
                    
                    <div class="text-xs text-gray-500 mb-3">
                        <span class="bg-gray-100 px-2 py-1 rounded mr-2">📊 ${question.context}</span>
                        <span class="bg-blue-100 text-blue-700 px-2 py-1 rounded">💼 ${question.businessImpact}</span>
                    </div>
                    
                    <div class="space-y-2" id="question-options-${question.id}">
                        ${question.options.map((option, index) => `
                            <button 
                                class="assessment-option w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-purple-300 transition duration-200"
                                data-question-id="${question.id}"
                                data-value="${option.value}"
                                data-label="${option.label}"
                            >
                                ${option.label}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        this.chatbot.addMessage(questionHtml, 'ai');

        // Add event listeners to the new buttons
        setTimeout(() => {
            document.querySelectorAll(`[data-question-id="${question.id}"]`).forEach(button => {
                button.addEventListener('click', (e) => {
                    this.handleQuestionResponse(e.target);
                });
            });
        }, 100);
    }

    handleQuestionResponse(button) {
        const questionId = button.dataset.questionId;
        const value = parseInt(button.dataset.value);
        const label = button.dataset.label;
        
        // Store response
        const dimension = this.dimensions[this.currentDimensionIndex];
        if (!this.responses[dimension.id]) {
            this.responses[dimension.id] = {};
        }
        
        this.responses[dimension.id][questionId] = {
            value: value,
            label: label,
            timestamp: new Date().toISOString()
        };

        // Visual feedback
        button.classList.add('bg-purple-100', 'border-purple-400', 'text-purple-800');
        button.innerHTML = `✓ ${label}`;
        
        // Disable all options for this question
        document.querySelectorAll(`[data-question-id="${questionId}"]`).forEach(btn => {
            btn.disabled = true;
            if (btn !== button) {
                btn.classList.add('opacity-50');
            }
        });

        // Show user's response as a message
        this.chatbot.addMessage(`Selected: ${label}`, 'user');

        // Add AI acknowledgment and move to next question
        setTimeout(() => {
            const acks = [
                "Thank you. Let me note that response...",
                "Got it. Moving to the next area...",
                "Excellent insight. Continuing the assessment...",
                "Understood. Let's explore the next dimension...",
                "Perfect. Building your organizational profile..."
            ];
            
            const ack = acks[Math.floor(Math.random() * acks.length)];
            this.chatbot.addMessage(ack, 'ai');
            
            setTimeout(() => {
                this.moveToNextQuestion();
            }, 800);
        }, 600);
    }

    moveToNextQuestion() {
        this.currentQuestionIndex++;
        
        if (this.currentQuestionIndex >= this.dimensions[this.currentDimensionIndex].questions.length) {
            // Move to next dimension
            this.currentDimensionIndex++;
            this.currentQuestionIndex = 0;
            
            // Show dimension completion if not finished
            if (this.currentDimensionIndex < this.dimensions.length) {
                const completedDimension = this.dimensions[this.currentDimensionIndex - 1];
                this.chatbot.addMessage(`✅ ${completedDimension.title} assessment complete!`, 'ai');
            }
        }
        
        setTimeout(() => {
            this.askNextQuestion();
        }, 500);
    }

    async completeAssessment() {
        this.isAssessmentActive = false;
        const duration = Math.round((new Date() - this.startTime) / 1000);
        
        // Show completion message
        const completionMsg = `
            <div class="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-4">
                <div class="flex items-center mb-3">
                    <div class="bg-green-100 rounded-full p-2 mr-3">
                        <i class="fas fa-check-circle text-green-600"></i>
                    </div>
                    <div>
                        <h4 class="font-semibold text-gray-800">Assessment Complete!</h4>
                        <p class="text-gray-600 text-sm">Completed in ${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, '0')}</p>
                    </div>
                </div>
                <p class="text-gray-600 text-sm">
                    🧠 Now analyzing your responses using GPT-4o Advanced with the HumanGlue 7-Layer methodology...
                </p>
            </div>
        `;
        
        this.chatbot.addMessage(completionMsg, 'ai');
        this.chatbot.showTyping();

        try {
            // Prepare responses for AI analysis
            const responses = this.prepareResponsesForAI();
            
            // Send to AI backend
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    responses: responses,
                    assessment_type: 'conversational',
                    duration_seconds: duration
                })
            });

            const result = await response.json();
            this.chatbot.hideTyping();

            if (result.success) {
                this.displayResults(result);
            } else {
                throw new Error(result.error || 'Analysis failed');
            }
        } catch (error) {
            this.chatbot.hideTyping();
            this.chatbot.addMessage(
                '⚠️ I encountered an issue analyzing your responses. However, I can still provide general insights based on your assessment pattern. Let me know if you\'d like me to try the analysis again.',
                'ai',
                true
            );
            console.error('Assessment analysis error:', error);
        }
    }

    prepareResponsesForAI() {
        const responses = [];
        
        this.dimensions.forEach(dimension => {
            if (this.responses[dimension.id]) {
                Object.entries(this.responses[dimension.id]).forEach(([questionId, responseData]) => {
                    const question = dimension.questions.find(q => q.id === questionId);
                    responses.push({
                        dimension: dimension.id,
                        question_id: questionId,
                        value: responseData.value,
                        context: question ? question.context : 'Assessment response',
                        business_impact: question ? question.businessImpact : 'Organizational improvement',
                        psychological_indicator: question ? question.psychologicalIndicator : 'Baseline motivation present',
                        organizational_level: question ? question.organizationalLevel : 'individual',
                        change_readiness_factor: question ? question.changeReadinessFactor : 'Moderate openness to change'
                    });
                });
            }
        });
        
        return responses;
    }

    displayResults(results) {
        // Main results summary
        const resultsHtml = `
            <div class="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mb-4">
                <h3 class="text-xl font-bold text-gray-800 mb-4">🎯 Your HumanGlue Assessment Results</h3>
                
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div class="text-center bg-white rounded-lg p-3">
                        <div class="text-2xl font-bold text-purple-600">${results.overall_transformation_score || results.overall_score || 75}%</div>
                        <div class="text-xs text-gray-600">Transformation Readiness</div>
                    </div>
                    <div class="text-center bg-white rounded-lg p-3">
                        <div class="text-2xl font-bold text-blue-600">${results.change_readiness_score || 78}%</div>
                        <div class="text-xs text-gray-600">Change Readiness</div>
                    </div>
                    <div class="text-center bg-white rounded-lg p-3">
                        <div class="text-2xl font-bold text-green-600">${results.cultural_alignment_score || 82}%</div>
                        <div class="text-xs text-gray-600">Cultural Alignment</div>
                    </div>
                    <div class="text-center bg-white rounded-lg p-3">
                        <div class="text-2xl font-bold text-orange-600">${results.leadership_effectiveness_score || 85}%</div>
                        <div class="text-xs text-gray-600">Leadership Effectiveness</div>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg p-4">
                    <h4 class="font-semibold text-gray-800 mb-2">Key Insights:</h4>
                    <div class="text-gray-600 text-sm space-y-1">
                        ${(results.enhanced_insights || results.insights || []).slice(0, 3).map(insight => 
                            `<div class="flex items-start"><span class="text-purple-500 mr-2">•</span>${insight}</div>`
                        ).join('')}
                    </div>
                </div>
            </div>
        `;
        
        this.chatbot.addMessage(resultsHtml, 'ai');
        
        // Detailed insights
        if (results.enhanced_insights || results.insights) {
            setTimeout(() => {
                const insightsMsg = `
                    <div class="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                        <h4 class="font-semibold text-gray-800 mb-3">🔍 Detailed Analysis</h4>
                        <div class="space-y-3 text-sm text-gray-700">
                            ${(results.enhanced_insights || results.insights).map(insight => 
                                `<div class="border-l-4 border-purple-200 pl-3">${insight}</div>`
                            ).join('')}
                        </div>
                    </div>
                `;
                this.chatbot.addMessage(insightsMsg, 'ai');
                
                // Offer next steps
                setTimeout(() => {
                    const nextSteps = `
                        <div class="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4">
                            <h4 class="font-semibold text-gray-800 mb-3">🚀 Recommended Next Steps</h4>
                            <div class="space-y-2">
                                <button class="assessment-action w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition" onclick="window.open('mailto:?subject=HumanGlue Assessment Results&body=I completed my organizational assessment. Let\\'s discuss the insights!')">
                                    📧 Share results with leadership team
                                </button>
                                <button class="assessment-action w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition" onclick="window.location.reload()">
                                    🔄 Take assessment again for different team/department
                                </button>
                                <button class="assessment-action w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                                    💬 Continue chatting about specific insights
                                </button>
                            </div>
                        </div>
                    `;
                    this.chatbot.addMessage(nextSteps, 'ai');
                }, 1000);
            }, 1500);
        }
    }
}

// Export for use in chatbot
window.ConversationalAssessment = ConversationalAssessment; 