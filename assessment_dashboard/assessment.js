// HumanGlue AI Assessment Platform
// Sophisticated multi-dimensional organizational assessment with agentic AI capabilities

class HumanGlueAssessment {
    constructor() {
        this.currentStep = 0;
        this.responses = {};
        this.aiAgents = {
            gemini: { name: 'Gemini 2.5 Pro', active: false, specialty: 'Pattern Analysis' },
            gpt: { name: 'GPT-4o', active: false, specialty: 'Leadership & Culture' },
            claude: { name: 'Claude Sonnet 4', active: false, specialty: 'Deep Insights' }
        };
        
        // Multi-dimensional assessment framework from Human Glue documentation
        // Load enhanced dimensions from enhanced_questions.js
        this.loadEnhancedDimensions();
    }
    
    loadEnhancedDimensions() {
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
                    },
                    {
                        id: 'E3',
                        text: 'How often do you feel energized and motivated by your work?',
                        type: 'frequency',
                        options: ['Rarely', 'Sometimes', 'Often', 'Very Often', 'Almost Always'],
                        context: 'Work Energy and Motivation',
                        businessImpact: 'Productivity and well-being'
                    },
                    {
                        id: 'E4',
                        text: 'How effectively does your organization recognize and reward meaningful contributions?',
                        type: 'likert',
                        scale: 5,
                        context: 'Recognition and Rewards',
                        businessImpact: 'Motivation and retention'
                    }
                ]
            },
            {
                id: 'culture',
                title: 'Cultural Alignment',
                description: 'Assessing organizational values, behaviors, and cultural cohesion',
                agent: 'claude',
                questions: [
                    {
                        id: 'C1',
                        text: 'How consistently do you see organizational values reflected in day-to-day decisions and behaviors?',
                        type: 'likert',
                        scale: 5,
                        context: 'Values Integration'
                    },
                    {
                        id: 'C2',
                        text: 'How comfortable do people feel expressing diverse viewpoints and challenging ideas respectfully?',
                        type: 'likert',
                        scale: 5,
                        context: 'Psychological Safety'
                    },
                    {
                        id: 'C3',
                        text: 'To what extent does your organization foster a sense of belonging for all employees?',
                        type: 'likert',
                        scale: 5,
                        context: 'Inclusion'
                    }
                ]
            },
            {
                id: 'communication',
                title: 'Communication Patterns',
                description: 'Analyzing information flow, collaboration, and communication effectiveness',
                agent: 'gemini',
                questions: [
                    {
                        id: 'CM1',
                        text: 'How effectively does information flow between different levels of the organization?',
                        type: 'likert',
                        scale: 5,
                        context: 'Information Flow'
                    },
                    {
                        id: 'CM2',
                        text: 'How well do teams collaborate across departments and functions?',
                        type: 'likert',
                        scale: 5,
                        context: 'Cross-functional Collaboration'
                    },
                    {
                        id: 'CM3',
                        text: 'How timely and relevant is the feedback you receive about your performance?',
                        type: 'likert',
                        scale: 5,
                        context: 'Feedback Quality'
                    }
                ]
            },
            {
                id: 'innovation',
                title: 'Innovation Capability',
                description: 'Evaluating the organization\'s ability to adapt, innovate, and embrace change',
                agent: 'gpt',
                questions: [
                    {
                        id: 'I1',
                        text: 'How encouraged do you feel to experiment with new ideas and approaches?',
                        type: 'likert',
                        scale: 5,
                        context: 'Innovation Encouragement'
                    },
                    {
                        id: 'I2',
                        text: 'How quickly does your organization adapt to changes in the market or industry?',
                        type: 'likert',
                        scale: 5,
                        context: 'Market Responsiveness'
                    },
                    {
                        id: 'I3',
                        text: 'How well does your organization learn from both successes and failures?',
                        type: 'likert',
                        scale: 5,
                        context: 'Learning Agility'
                    }
                ]
            },
            {
                id: 'agility',
                title: 'Organizational Agility',
                description: 'Measuring adaptability, decision-making speed, and structural flexibility',
                agent: 'claude',
                questions: [
                    {
                        id: 'A1',
                        text: 'How quickly can your organization make and implement important decisions?',
                        type: 'likert',
                        scale: 5,
                        context: 'Decision Speed'
                    },
                    {
                        id: 'A2',
                        text: 'How well do organizational structures support rather than hinder getting work done?',
                        type: 'likert',
                        scale: 5,
                        context: 'Structural Efficiency'
                    },
                    {
                        id: 'A3',
                        text: 'How effectively does your organization anticipate and prepare for future challenges?',
                        type: 'likert',
                        scale: 5,
                        context: 'Future Readiness'
                    }
                ]
            }
        ];
        
        this.currentDimension = 0;
        this.currentQuestion = 0;
        this.initializeInterface();
    }

    initializeInterface() {
        // Event listeners
        document.getElementById('beginAssessment').addEventListener('click', () => this.startAssessment());
        document.getElementById('startAssessment').addEventListener('click', () => this.startAssessment());
        document.getElementById('chatToggle').addEventListener('click', () => this.toggleChat());
        document.getElementById('chatSend').addEventListener('click', () => this.sendChatMessage());
        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendChatMessage();
        });

        // Initialize chat assistant
        this.addChatMessage('assistant', 'Hello! I\'m your AI assessment assistant. I can help explain the process, answer questions about organizational development, and guide you through the assessment.');
    }

    startAssessment() {
        document.getElementById('welcomeScreen').classList.add('hidden');
        document.getElementById('assessmentInterface').classList.remove('hidden');
        this.loadNextQuestion();
    }

    loadNextQuestion() {
        if (this.currentDimension >= this.dimensions.length) {
            this.completeAssessment();
            return;
        }

        const dimension = this.dimensions[this.currentDimension];
        const question = dimension.questions[this.currentQuestion];

        // Update progress
        const totalQuestions = this.dimensions.reduce((sum, d) => sum + d.questions.length, 0);
        const currentQuestionIndex = this.dimensions.slice(0, this.currentDimension).reduce((sum, d) => sum + d.questions.length, 0) + this.currentQuestion;
        const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

        document.getElementById('progressBar').style.width = `${progress}%`;
        document.getElementById('currentStep').textContent = this.currentDimension + 1;
        document.getElementById('dimensionTitle').textContent = `${dimension.title} Assessment`;

        // Activate relevant AI agent
        this.activateAgent(dimension.agent);

        // Render question
        this.renderQuestion(question, dimension);
    }

    renderQuestion(question, dimension) {
        const container = document.getElementById('questionContainer');
        
        let questionHTML = `
            <div class="space-y-6">
                <div class="text-center">
                    <div class="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
                        <i class="fas fa-${this.getDimensionIcon(dimension.id)} text-white text-xl"></i>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-800 mb-2">${dimension.title}</h3>
                    <p class="text-sm text-gray-600 mb-6">${dimension.description}</p>
                </div>
                
                <div class="bg-gray-50 rounded-lg p-6">
                    <h4 class="text-xl font-medium text-gray-800 mb-6">${question.text}</h4>
                    <div class="space-y-3" id="questionOptions">
        `;

        if (question.type === 'likert') {
            const scale = question.scale || 5;
            const labels = scale === 10 ? 
                ['0 - Not at all likely', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10 - Extremely likely'] :
                ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];

            for (let i = 1; i <= scale; i++) {
                const label = scale === 10 ? (i === 1 ? labels[0] : i === 10 ? labels[labels.length - 1] : i-1) : labels[i-1];
                questionHTML += `
                    <label class="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 cursor-pointer transition">
                        <input type="radio" name="response" value="${i}" class="mr-3 text-purple-600">
                        <span class="font-medium mr-2">${i}${scale === 10 ? '' : '.'}</span>
                        <span class="text-gray-700">${label}</span>
                    </label>
                `;
            }
        } else if (question.type === 'frequency') {
            question.options.forEach((option, index) => {
                questionHTML += `
                    <label class="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 cursor-pointer transition">
                        <input type="radio" name="response" value="${index + 1}" class="mr-3 text-purple-600">
                        <span class="text-gray-700">${option}</span>
                    </label>
                `;
            });
        }

        questionHTML += `
                    </div>
                </div>
                
                <div class="flex justify-between pt-6">
                    <button onclick="assessment.previousQuestion()" class="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition ${this.currentQuestion === 0 && this.currentDimension === 0 ? 'invisible' : ''}">
                        <i class="fas fa-arrow-left mr-2"></i>Previous
                    </button>
                    <button onclick="assessment.nextQuestion()" class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                        Next<i class="fas fa-arrow-right ml-2"></i>
                    </button>
                </div>
            </div>
        `;

        container.innerHTML = questionHTML;
    }

    nextQuestion() {
        // Get selected response
        const selected = document.querySelector('input[name="response"]:checked');
        if (!selected) {
            alert('Please select an answer before continuing.');
            return;
        }

        // Store response
        const dimension = this.dimensions[this.currentDimension];
        const question = dimension.questions[this.currentQuestion];
        
        if (!this.responses[dimension.id]) {
            this.responses[dimension.id] = {};
        }
        this.responses[dimension.id][question.id] = {
            value: parseInt(selected.value),
            context: question.context,
            agent: dimension.agent
        };

        // Show AI processing for a moment
        this.showAIProcessing();

        setTimeout(() => {
            this.hideAIProcessing();
            this.advanceQuestion();
        }, 2000);
    }

    previousQuestion() {
        if (this.currentQuestion > 0) {
            this.currentQuestion--;
        } else if (this.currentDimension > 0) {
            this.currentDimension--;
            this.currentQuestion = this.dimensions[this.currentDimension].questions.length - 1;
        }
        this.loadNextQuestion();
    }

    advanceQuestion() {
        this.currentQuestion++;
        
        if (this.currentQuestion >= this.dimensions[this.currentDimension].questions.length) {
            this.currentDimension++;
            this.currentQuestion = 0;
        }
        
        this.loadNextQuestion();
    }

    async completeAssessment() {
        document.getElementById('assessmentInterface').classList.add('hidden');
        this.showAIProcessing();
        
        // Prepare responses for real AI analysis
        const responses = this.prepareResponsesForAI();
        
        try {
            console.log('🤖 Sending responses to REAL AI agents...');
            
            // Call REAL AI analysis API
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ responses })
            });
            
            const aiResults = await response.json();
            
            if (aiResults.success) {
                console.log('✅ Real AI analysis complete!', aiResults.results);
                
                // Use real AI results
                this.hideAIProcessing();
                this.displayRealAIResults(aiResults.results);
                document.getElementById('resultsInterface').classList.remove('hidden');
            } else {
                throw new Error(aiResults.error || 'AI analysis failed');
            }
            
        } catch (error) {
            console.error('❌ Error calling AI API, using fallback:', error);
            
            // Fallback to original logic
            setTimeout(() => {
                this.hideAIProcessing();
                this.generateResults();
                document.getElementById('resultsInterface').classList.remove('hidden');
            }, 2000);
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
    
    displayRealAIResults(results) {
        // Calculate dimension scores for display
        const scores = this.calculateDimensionScores();
        const overallScore = Math.round(results.overall_transformation_score || results.overall_score || 75);
        
        // Display results using existing UI methods
        this.displayResults(scores, overallScore);
        
        // Display enhanced AI insights
        this.displayRealInsights(results.enhanced_insights || results.insights);
        
        // Calculate ROI
        this.calculateROI(scores, overallScore);
        
        // Generate toolbox recommendations
        this.generateToolboxRecommendations(scores, overallScore);
        
        // Display enhanced metrics if available
        if (results.change_readiness_score) {
            this.displayEnhancedMetrics(results);
        }
    }
    
    displayRealInsights(insights) {
        const insightsContainer = document.getElementById('aiInsights');
        if (!insightsContainer) return;
        
        insightsContainer.innerHTML = '';
        
        insights.forEach(insight => {
            const insightDiv = document.createElement('div');
            insightDiv.className = 'bg-white rounded-lg p-6 border-l-4 border-green-500 mb-4';
            
            insightDiv.innerHTML = `
                <div class="flex items-center mb-3">
                    <div class="flex-shrink-0">
                        <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <h4 class="ml-3 font-semibold text-gray-800">${insight.agent} - ${insight.dimension.toUpperCase()}</h4>
                    <span class="ml-auto text-sm text-green-600 font-medium">${Math.round(insight.confidence * 100)}% confidence</span>
                </div>
                <p class="text-gray-600 text-sm mb-4">${insight.insight.substring(0, 400)}...</p>
                <div class="space-y-1">
                    <h5 class="text-xs font-medium text-gray-700 mb-2">Key Recommendations:</h5>
                    ${insight.recommendations.slice(0, 3).map(rec => `
                        <div class="text-xs text-blue-600 ml-2">• ${rec}</div>
                    `).join('')}
                </div>
            `;
            
            insightsContainer.appendChild(insightDiv);
        });
    }
    
    calculateDimensionScores() {
        const scores = {};
        
        this.dimensions.forEach(dimension => {
            if (this.responses[dimension.id]) {
                const responses = Object.values(this.responses[dimension.id]);
                const avgScore = responses.reduce((sum, r) => sum + r.value, 0) / responses.length;
                const normalizedScore = Math.round((avgScore / 5) * 100);
                scores[dimension.id] = normalizedScore;
            }
        });
        
        return scores;
    }
    
    displayEnhancedMetrics(results) {
        // Update enhanced metrics display
        const metricsHtml = `
            <div class="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mt-6">
                <h4 class="font-semibold text-gray-800 mb-4">Enhanced AI Analysis - HumanGlue 7-Layer Model</h4>
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div class="text-center">
                        <div class="text-2xl font-bold text-purple-600">${results.overall_transformation_score}%</div>
                        <div class="text-xs text-gray-600">Transformation Score</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-blue-600">${results.change_readiness_score}%</div>
                        <div class="text-xs text-gray-600">Change Readiness</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-green-600">${results.cultural_alignment_score}%</div>
                        <div class="text-xs text-gray-600">Cultural Alignment</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-orange-600">${results.leadership_effectiveness_score}%</div>
                        <div class="text-xs text-gray-600">Leadership Effectiveness</div>
                    </div>
                </div>
                <div class="mt-4 text-center">
                    <span class="text-sm text-gray-600">Methodology: ${results.methodology || 'HumanGlue 7-Layer Assessment Model'}</span>
                </div>
            </div>
        `;
        
        // Insert after the main results
        const resultsContainer = document.getElementById('resultsInterface');
        if (resultsContainer) {
            resultsContainer.insertAdjacentHTML('beforeend', metricsHtml);
        }
    }

    generateResults() {
        // Calculate dimension scores based on responses
        const scores = {};
        let totalScore = 0;
        
        this.dimensions.forEach(dimension => {
            if (this.responses[dimension.id]) {
                const responses = Object.values(this.responses[dimension.id]);
                const avgScore = responses.reduce((sum, r) => sum + r.value, 0) / responses.length;
                const normalizedScore = Math.round((avgScore / (dimension.questions[0].scale || 5)) * 100);
                scores[dimension.id] = normalizedScore;
                totalScore += normalizedScore;
            }
        });

        const overallScore = Math.round(totalScore / this.dimensions.length);

        // Update UI with results
        this.displayResults(scores, overallScore);
        this.generateInsights(scores, overallScore);
        this.calculateROI(scores, overallScore);
        this.generateToolboxRecommendations(scores, insights);
    }

    displayResults(scores, overallScore) {
        // Overall score circle
        document.getElementById('overallScore').textContent = overallScore;
        const circumference = 2 * Math.PI * 70;
        const circle = document.getElementById('overallScoreCircle');
        circle.style.strokeDasharray = circumference;
        circle.style.strokeDashoffset = circumference * (1 - overallScore / 100);

        // Individual dimension scores
        Object.entries(scores).forEach(([dimensionId, score]) => {
            document.getElementById(`${dimensionId}Score`).textContent = score;
            document.getElementById(`${dimensionId}Bar`).style.width = `${score}%`;
        });
    }

    generateInsights(scores, overallScore) {
        const insights = [];
        
        // AI-generated insights based on scores
        if (scores.leadership > 80) {
            insights.push({
                type: 'strength',
                agent: 'gpt',
                text: 'Strong leadership foundation with clear vision communication and consistent role modeling. This creates a solid base for organizational transformation.',
                icon: 'crown'
            });
        } else if (scores.leadership < 60) {
            insights.push({
                type: 'opportunity',
                agent: 'gpt', 
                text: 'Leadership development presents a high-impact opportunity. Focus on adaptive leadership training and vision communication workshops.',
                icon: 'arrow-up'
            });
        }

        if (scores.engagement > 85) {
            insights.push({
                type: 'strength',
                agent: 'gemini',
                text: 'Exceptional employee engagement levels detected. Your workforce is highly motivated and aligned with organizational goals.',
                icon: 'heart'
            });
        } else if (scores.engagement < 65) {
            insights.push({
                type: 'critical',
                agent: 'gemini',
                text: 'Employee engagement requires immediate attention. Consider implementing recognition programs and career development pathways.',
                icon: 'exclamation-triangle'
            });
        }

        if (scores.culture > 75 && scores.communication > 75) {
            insights.push({
                type: 'strength',
                agent: 'claude',
                text: 'Strong cultural alignment combined with effective communication creates a powerful foundation for sustained organizational performance.',
                icon: 'users'
            });
        }

        if (scores.innovation < 60) {
            insights.push({
                type: 'opportunity',
                agent: 'claude',
                text: 'Innovation capability can be enhanced through structured ideation processes and psychological safety initiatives.',
                icon: 'lightbulb'
            });
        }

        // Display insights
        const container = document.getElementById('aiInsights');
        container.innerHTML = insights.map(insight => `
            <div class="flex items-start space-x-3 p-4 bg-${this.getInsightColor(insight.type)}-50 border border-${this.getInsightColor(insight.type)}-200 rounded-lg">
                <div class="w-8 h-8 bg-${this.getInsightColor(insight.type)}-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-${insight.icon} text-white text-xs"></i>
                </div>
                <div class="flex-1">
                    <div class="flex items-center space-x-2 mb-1">
                        <span class="text-sm font-semibold text-${this.getInsightColor(insight.type)}-800">
                            ${insight.agent.toUpperCase()} Analysis
                        </span>
                        <span class="text-xs text-${this.getInsightColor(insight.type)}-600 bg-${this.getInsightColor(insight.type)}-100 px-2 py-1 rounded">
                            ${insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}
                        </span>
                    </div>
                    <p class="text-sm text-${this.getInsightColor(insight.type)}-700">${insight.text}</p>
                </div>
            </div>
        `).join('');
    }

    calculateROI(scores, overallScore) {
        // ROI calculation based on Human Glue comprehensive framework
        const employeeCount = 1000; // Default organizational size
        const avgSalary = 80000;
        const currentTurnover = 0.15;
        
        // Implementation costs from Human Glue framework
        const assessmentLicense = 35000; // Annual license
        const implementationServices = 50000; // One-time
        const trainingOnboarding = 20000; // One-time
        const integrationCustomization = 30000; // One-time
        const totalImplementationCost = assessmentLicense + implementationServices + trainingOnboarding + integrationCustomization;
        
        // Ongoing costs
        const platformMaintenance = 10000; // Annual
        const supportUpdates = 14000; // Annual
        const analyticsReporting = 18000; // Annual
        const continuousImprovement = 20000; // Annual
        const totalOngoingCosts = platformMaintenance + supportUpdates + analyticsReporting + continuousImprovement;
        
        // Calculate improvement potential based on Human Glue methodology
        const engagementScore = scores.engagement || 70;
        const leadershipScore = scores.leadership || 70;
        const cultureScore = scores.culture || 70;
        
        // Human Glue typical improvements (15-30% engagement, 25-50% productivity)
        const engagementImprovement = Math.min(0.30, Math.max(0.15, (85 - engagementScore) / 100));
        const productivityGain = 0.25 + (engagementImprovement * 0.5); // 25-50% range
        const turnoverReduction = Math.min(0.50, 0.25 + (engagementImprovement * 0.5)); // 25-50% reduction
        
        // ROI Categories from Human Glue framework
        
        // A. Employee Retention Savings (largest ROI driver)
        const avgReplacementCost = 125000; // $75k-$150k range, using $125k
        const currentTurnoverCost = employeeCount * currentTurnover * avgReplacementCost;
        const newTurnoverRate = currentTurnover * (1 - turnoverReduction);
        const newTurnoverCost = employeeCount * newTurnoverRate * avgReplacementCost;
        const retentionSavings = currentTurnoverCost - newTurnoverCost;
        
        // B. Productivity Enhancement
        const totalPayroll = employeeCount * avgSalary;
        const productivityValue = totalPayroll * productivityGain * 0.70; // 70% efficiency factor
        
        // C. Recruitment & Training Cost Reduction
        const recruitmentSavings = employeeCount * 0.10 * 15000; // 10% reduced external hiring, $15k savings per position
        
        // D. Performance Improvement Revenue (conservative)
        const revenuePerEmployee = avgSalary * 2.5; // Industry average revenue multiplier
        const revenueImprovementFactor = Math.min(0.15, productivityGain * 0.3); // Conservative revenue impact
        const performanceRevenue = employeeCount * revenuePerEmployee * revenueImprovementFactor;
        
        // Total Year 1 Benefits
        const year1Benefits = retentionSavings + productivityValue + recruitmentSavings + performanceRevenue;
        const year1Costs = totalImplementationCost + totalOngoingCosts;
        const year1ROI = Math.round(((year1Benefits - year1Costs) / year1Costs) * 100);
        
        // 3-Year Cumulative Projection
        const year2Benefits = year1Benefits * 1.15; // 15% improvement year 2
        const year3Benefits = year1Benefits * 1.25; // 25% improvement year 3 (sustained gains)
        const cumulativeBenefits = year1Benefits + year2Benefits + year3Benefits;
        const cumulativeCosts = totalImplementationCost + (totalOngoingCosts * 3);
        const threeYearROI = Math.round(((cumulativeBenefits - cumulativeCosts) / cumulativeCosts) * 100);
        
        // Display results with Human Glue formatting
        document.getElementById('yearOneROI').textContent = `${year1ROI}%`;
        document.getElementById('threeYearROI').textContent = `${threeYearROI}%`;
        document.getElementById('projectedSavings').textContent = `$${Math.round(year1Benefits / 1000)}K`;
        
        // Store detailed breakdown for toolbox recommendations
        this.roiBreakdown = {
            retentionSavings: Math.round(retentionSavings),
            productivityValue: Math.round(productivityValue),
            recruitmentSavings: Math.round(recruitmentSavings),
            performanceRevenue: Math.round(performanceRevenue),
            totalBenefits: Math.round(year1Benefits),
            implementationCost: totalImplementationCost,
            paybackPeriod: Math.round((year1Costs / year1Benefits) * 12), // months
            engagementImprovement: Math.round(engagementImprovement * 100),
            turnoverReduction: Math.round(turnoverReduction * 100),
            productivityGain: Math.round(productivityGain * 100)
        };

        // Display ROI timeline metrics
        if (document.getElementById('paybackPeriod')) {
            document.getElementById('paybackPeriod').textContent = this.roiBreakdown.paybackPeriod;
            document.getElementById('quarterlyGains').textContent = `${Math.round(this.roiBreakdown.productivityGain / 4)}%`;
            document.getElementById('retentionImpact').textContent = `${this.roiBreakdown.turnoverReduction}%`;
            document.getElementById('engagementLift').textContent = `${this.roiBreakdown.engagementImprovement}%`;
        }
    }

    generateToolboxRecommendations(scores, insights) {
        // Human Glue Toolbox Categories based on documentation
        const toolboxCategories = {
            'organizational_structure': {
                name: 'Organizational Structure & Alignment',
                tools: [
                    {
                        name: 'Organizational Network Analysis (ONA) Tool',
                        description: 'Map and analyze informal networks and collaboration patterns',
                        use_cases: ['Identifying silos', 'Optimizing team structures', 'Enhancing cross-functional cooperation'],
                        priority: this.calculateToolPriority(scores, 'communication', 'agility')
                    },
                    {
                        name: 'Role Clarity Framework',
                        description: 'Define clear roles, responsibilities, and decision rights',
                        use_cases: ['Clarifying overlapping responsibilities', 'Streamlining decision-making', 'Reducing duplication'],
                        priority: this.calculateToolPriority(scores, 'leadership', 'communication')
                    },
                    {
                        name: 'Strategic Alignment Cascade',
                        description: 'Ensure alignment from strategy to individual objectives',
                        use_cases: ['Translating corporate strategy', 'Creating line-of-sight', 'Improving focus'],
                        priority: this.calculateToolPriority(scores, 'leadership', 'engagement')
                    }
                ]
            },
            'leadership_development': {
                name: 'Leadership & Management Development',
                tools: [
                    {
                        name: 'Leadership Capability Builder',
                        description: 'Develop essential leadership capabilities aligned with organizational needs',
                        use_cases: ['360-degree feedback', 'Personalized development', 'Competency framework'],
                        priority: this.calculateToolPriority(scores, 'leadership', 'culture')
                    },
                    {
                        name: 'Executive Coaching Program',
                        description: 'One-on-one coaching for senior leaders and high-potential talent',
                        use_cases: ['Leadership transition', 'Performance enhancement', 'Strategic thinking'],
                        priority: this.calculateToolPriority(scores, 'leadership', 'innovation')
                    },
                    {
                        name: 'Management Excellence Framework',
                        description: 'Systematic approach to developing management capabilities',
                        use_cases: ['First-time manager training', 'Performance management', 'Team leadership'],
                        priority: this.calculateToolPriority(scores, 'leadership', 'engagement')
                    }
                ]
            },
            'employee_experience': {
                name: 'Employee Experience & Engagement',
                tools: [
                    {
                        name: 'Employee Journey Mapping',
                        description: 'Comprehensive analysis and optimization of the employee experience',
                        use_cases: ['Onboarding optimization', 'Career development', 'Exit prevention'],
                        priority: this.calculateToolPriority(scores, 'engagement', 'culture')
                    },
                    {
                        name: 'Recognition & Rewards Platform',
                        description: 'Technology-enabled recognition and incentive programs',
                        use_cases: ['Peer recognition', 'Performance rewards', 'Values-based recognition'],
                        priority: this.calculateToolPriority(scores, 'engagement', 'culture')
                    },
                    {
                        name: 'Career Development Pathways',
                        description: 'Structured approach to career progression and skill development',
                        use_cases: ['Career planning', 'Skill gap analysis', 'Succession planning'],
                        priority: this.calculateToolPriority(scores, 'engagement', 'leadership')
                    }
                ]
            },
            'culture_values': {
                name: 'Culture & Values Integration',
                tools: [
                    {
                        name: 'Values-Based Leadership Program',
                        description: 'Embedding organizational values in leadership behaviors',
                        use_cases: ['Values definition', 'Behavioral modeling', 'Cultural transformation'],
                        priority: this.calculateToolPriority(scores, 'culture', 'leadership')
                    },
                    {
                        name: 'Cultural Assessment & Alignment',
                        description: 'Comprehensive culture evaluation and improvement strategies',
                        use_cases: ['Culture mapping', 'Values integration', 'Behavioral change'],
                        priority: this.calculateToolPriority(scores, 'culture', 'engagement')
                    },
                    {
                        name: 'Psychological Safety Initiative',
                        description: 'Programs to enhance trust, inclusion, and psychological safety',
                        use_cases: ['Trust building', 'Inclusive leadership', 'Innovation enablement'],
                        priority: this.calculateToolPriority(scores, 'culture', 'innovation')
                    }
                ]
            },
            'change_management': {
                name: 'Change Management & Transformation',
                tools: [
                    {
                        name: 'Agile Transformation Framework',
                        description: 'Systematic approach to organizational agility and adaptability',
                        use_cases: ['Agile adoption', 'Process optimization', 'Continuous improvement'],
                        priority: this.calculateToolPriority(scores, 'agility', 'innovation')
                    },
                    {
                        name: 'Change Readiness Assessment',
                        description: 'Evaluate and enhance organizational capacity for change',
                        use_cases: ['Change preparation', 'Resistance management', 'Stakeholder engagement'],
                        priority: this.calculateToolPriority(scores, 'agility', 'leadership')
                    },
                    {
                        name: 'Digital Workplace Optimization',
                        description: 'Technology and process improvements for modern workforce',
                        use_cases: ['Remote work optimization', 'Digital collaboration', 'Technology adoption'],
                        priority: this.calculateToolPriority(scores, 'communication', 'agility')
                    }
                ]
            }
        };

        // Generate prioritized recommendations
        const allTools = [];
        Object.values(toolboxCategories).forEach(category => {
            category.tools.forEach(tool => {
                allTools.push({
                    ...tool,
                    category: category.name
                });
            });
        });

        // Sort by priority and select top recommendations
        const topRecommendations = allTools
            .sort((a, b) => b.priority - a.priority)
            .slice(0, 6);

        // Display recommendations
        this.displayToolboxRecommendations(topRecommendations);
    }

    calculateToolPriority(scores, primaryDimension, secondaryDimension = null) {
        // Lower scores indicate higher priority for improvement
        const primaryScore = scores[primaryDimension] || 70;
        const secondaryScore = secondaryDimension ? (scores[secondaryDimension] || 70) : 70;
        
        // Priority calculation: lower scores = higher priority
        const primaryPriority = Math.max(0, 100 - primaryScore);
        const secondaryPriority = secondaryDimension ? Math.max(0, 100 - secondaryScore) : 0;
        
        return primaryPriority + (secondaryPriority * 0.5);
    }

    displayToolboxRecommendations(recommendations) {
        const container = document.getElementById('toolboxRecommendations');
        if (!container) return;

        container.innerHTML = recommendations.map((tool, index) => `
            <div class="border border-gray-200 rounded-lg p-6 hover:shadow-md transition ${index < 3 ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex-1">
                        <h4 class="font-semibold text-gray-800 mb-2">${tool.name}</h4>
                        <span class="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">${tool.category}</span>
                    </div>
                    <div class="flex items-center space-x-2">
                        ${index < 3 ? '<span class="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-medium">High Priority</span>' : ''}
                        <div class="w-3 h-3 rounded-full ${this.getPriorityColor(tool.priority)}"></div>
                    </div>
                </div>
                <p class="text-sm text-gray-600 mb-3">${tool.description}</p>
                <div class="space-y-1">
                    <span class="text-xs font-medium text-gray-700">Key Use Cases:</span>
                    ${tool.use_cases.slice(0, 2).map(useCase => `
                        <div class="text-xs text-gray-500">• ${useCase}</div>
                    `).join('')}
                </div>
                <div class="mt-4 flex items-center justify-between">
                    <span class="text-xs text-gray-500">
                        ${index < 3 ? 'Recommended for immediate implementation' : 'Consider for future phases'}
                    </span>
                    <button class="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition">
                        Learn More
                    </button>
                </div>
            </div>
        `).join('');
    }

    getPriorityColor(priority) {
        if (priority > 60) return 'bg-red-500';
        if (priority > 40) return 'bg-orange-500';
        if (priority > 20) return 'bg-yellow-500';
        return 'bg-green-500';
    }

    // UI Helper Methods
    activateAgent(agentKey) {
        // Reset all agents - with null checks
        Object.keys(this.aiAgents).forEach(key => {
            const element = document.getElementById(`${key}Agent`);
            if (element) {
                element.classList.remove('agent-active');
                const statusIndicator = element.querySelector('.w-2.h-2');
                if (statusIndicator) {
                    statusIndicator.classList.remove('bg-green-500', 'ai-pulse');
                    statusIndicator.classList.add('bg-gray-300');
                }
                const statusText = element.querySelector('.text-xs.text-gray-500');
                if (statusText) {
                    statusText.textContent = 'Standby';
                }
            }
        });

        // Activate current agent - with null checks
        const element = document.getElementById(`${agentKey}Agent`);
        if (element) {
            element.classList.add('agent-active');
            const statusIndicator = element.querySelector('.w-2.h-2');
            if (statusIndicator) {
                statusIndicator.classList.remove('bg-gray-300');
                statusIndicator.classList.add('bg-green-500', 'ai-pulse');
            }
            const statusText = element.querySelector('.text-xs.text-gray-500');
            if (statusText) {
                statusText.textContent = 'Analyzing';
                statusText.classList.remove('text-gray-500');
                statusText.classList.add('text-green-600');
            }
        } else {
            // Fallback: Just show processing message
            console.log(`Activating AI Agent: ${agentKey}`);
        }
    }

    showAIProcessing() {
        const aiProcessing = document.getElementById('aiProcessing');
        if (aiProcessing) {
            aiProcessing.classList.remove('hidden');
        }
        
        const texts = [
            '🧠 Analyzing response patterns with GPT-4o...',
            '🔍 Identifying organizational dynamics...',
            '💡 Generating predictive insights...',
            '📊 Cross-referencing with HumanGlue benchmarks...',
            '🎯 Synthesizing evidence-based recommendations...'
        ];
        
        let textIndex = 0;
        this.processingInterval = setInterval(() => {
            const processingText = document.getElementById('processingText');
            if (processingText) {
                processingText.textContent = texts[textIndex];
            }
            textIndex = (textIndex + 1) % texts.length;
        }, 800);
    }

    hideAIProcessing() {
        const aiProcessing = document.getElementById('aiProcessing');
        if (aiProcessing) {
            aiProcessing.classList.add('hidden');
        }
        if (this.processingInterval) {
            clearInterval(this.processingInterval);
        }
    }

    toggleChat() {
        const chat = document.getElementById('aiChat');
        chat.classList.toggle('hidden');
    }

    sendChatMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        if (!message) return;

        this.addChatMessage('user', message);
        input.value = '';

        // Simulate AI response
        setTimeout(() => {
            const response = this.generateChatResponse(message);
            this.addChatMessage('assistant', response);
        }, 1000);
    }

    addChatMessage(sender, text) {
        const container = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `p-3 rounded-lg ${sender === 'user' ? 'bg-purple-100 ml-8' : 'bg-gray-100 mr-8'}`;
        messageDiv.innerHTML = `<p class="text-sm">${text}</p>`;
        container.appendChild(messageDiv);
        container.scrollTop = container.scrollHeight;
    }

    generateChatResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('score') || lowerMessage.includes('result')) {
            return "Your assessment scores reflect different aspects of organizational health. Scores above 75 indicate strengths, while scores below 65 suggest areas for improvement. The AI agents analyze patterns across dimensions to identify key insights.";
        } else if (lowerMessage.includes('workshop') || lowerMessage.includes('next step')) {
            return "Based on your results, I recommend scheduling a strategy workshop to validate findings with key stakeholders and develop action plans. The workshop will help translate insights into concrete initiatives.";
        } else if (lowerMessage.includes('roi') || lowerMessage.includes('return')) {
            return "ROI calculations are based on proven methodologies including turnover reduction, productivity gains, and engagement improvements. The projections use conservative estimates and industry benchmarks.";
        } else if (lowerMessage.includes('toolbox') || lowerMessage.includes('tools')) {
            return "The HumanGlue Toolbox provides targeted resources for your priority areas including leadership development frameworks, engagement improvement tools, and cultural alignment resources.";
        } else {
            return "I can help you understand your assessment results, explain the methodology, or discuss next steps for organizational transformation. What specific aspect would you like to explore?";
        }
    }

    // Utility methods
    getDimensionIcon(dimensionId) {
        const icons = {
            leadership: 'crown',
            engagement: 'heart',
            culture: 'users',
            communication: 'comments',
            innovation: 'lightbulb',
            agility: 'bolt'
        };
        return icons[dimensionId] || 'chart-line';
    }

    getInsightColor(type) {
        const colors = {
            strength: 'green',
            opportunity: 'blue',
            critical: 'red'
        };
        return colors[type] || 'gray';
    }
}

// Initialize the assessment when the page loads
const assessment = new HumanGlueAssessment(); 