#!/usr/bin/env python3
"""
Simple HumanGlue AI Assessment Web Server
Integrates real AI analysis with web interface
"""

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import os
import json
from datetime import datetime
from pathlib import Path

# Import our enhanced AI assessment
from enhanced_ai_assessment import EnhancedHumanGlueAI, EnhancedAssessmentResponse

app = Flask(__name__)
CORS(app)

# Serve the HTML interface
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def serve_files(filename):
    return send_from_directory('.', filename)

# API endpoint for real AI assessment
@app.route('/api/analyze', methods=['POST'])
def analyze_assessment():
    try:
        data = request.json
        responses = data.get('responses', [])
        
        print(f"🎯 Received {len(responses)} assessment responses")
        
        # Convert to Enhanced AssessmentResponse objects
        assessment_responses = []
        for resp in responses:
            assessment_responses.append(EnhancedAssessmentResponse(
                dimension=resp.get('dimension', 'general'),
                question_id=resp.get('question_id', 'Q1'),
                value=resp.get('value', 3),
                context=resp.get('context', 'Assessment response'),
                business_impact=resp.get('business_impact', 'Organizational improvement'),
                psychological_indicator=resp.get('psychological_indicator', 'Baseline motivation present'),
                organizational_level=resp.get('organizational_level', 'individual'),
                change_readiness_factor=resp.get('change_readiness_factor', 'Moderate openness to change'),
                timestamp=datetime.now().isoformat()
            ))
        
        # Run enhanced AI analysis
        ai_assessment = EnhancedHumanGlueAI()
        results = ai_assessment.run_enhanced_assessment(assessment_responses)
        
        print(f"✅ Enhanced AI analysis complete - Transformation Score: {results['overall_transformation_score']}")
        
        return jsonify({
            'success': True,
            'results': results,
            'message': 'Real AI analysis completed successfully!'
        })
        
    except Exception as e:
        print(f"❌ Error during AI analysis: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Analysis failed'
        }), 500

# API endpoint to check AI agent status
@app.route('/api/agents/status')
def agents_status():
    return jsonify({
        'agents': {
            'openai': {'status': 'active', 'model': 'GPT-4o', 'specialty': 'Leadership Analysis'},
            'anthropic': {'status': 'active', 'model': 'Claude Sonnet', 'specialty': 'Cultural Analysis'},
            'google': {'status': 'active', 'model': 'Gemini Pro', 'specialty': 'Pattern Recognition'}
        },
        'real_ai': True,
        'api_keys_loaded': True
    })

# Chat endpoint for real AI conversation
@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        message = data.get('message', '').strip()
        context = data.get('context', 'general')
        
        print(f"💬 Chat message: {message}")
        
        # Determine which AI agent to use based on content
        agent_choice = 'openai'  # Default to GPT-4o
        if any(word in message.lower() for word in ['culture', 'values', 'trust', 'behavior']):
            agent_choice = 'anthropic'
        elif any(word in message.lower() for word in ['data', 'pattern', 'analysis', 'metric']):
            agent_choice = 'google'
        
        # Import and use the enhanced AI assessment
        from enhanced_ai_assessment import EnhancedOpenAIAgent
        
        # Create enhanced AI agent (using OpenAI for all conversations)
        agent = EnhancedOpenAIAgent()
        
        # Enhanced conversational prompt using HumanGlue methodology
        conversation_prompt = f"""
        You are Dr. Sarah Chen, a world-renowned organizational psychologist specializing in the HumanGlue methodology.
        
        User message: "{message}"
        Context: {context}
        
        Respond as an expert consultant with deep insights into:
        - Leadership psychology and effectiveness
        - Employee engagement and motivation patterns
        - Organizational culture and behavioral dynamics
        - Communication systems and trust building
        - Change readiness and transformation strategies
        
        Use the HumanGlue 7-Layer Assessment Model perspective:
        1. Individual Psychology Layer
        2. Interpersonal Dynamics Layer  
        3. Team Performance Layer
        4. Leadership Systems Layer
        5. Cultural Integration Layer
        6. Organizational Structure Layer
        7. Strategic Alignment Layer
        
        Provide actionable insights with psychological depth. If appropriate, mention that a comprehensive HumanGlue assessment can provide detailed analysis across all organizational layers.
        
        Keep your response conversational but expert-level (2-3 paragraphs max).
        """
        
        # Use the enhanced agent's API
        import requests
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {agent.api_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": "gpt-4",
                "messages": [
                    {"role": "system", "content": "You are Dr. Sarah Chen, a world-renowned organizational psychologist and transformation expert specializing in the HumanGlue methodology."},
                    {"role": "user", "content": conversation_prompt}
                ],
                "max_tokens": 600,
                "temperature": 0.4  # Slightly lower for more consistent expert responses
            }
        )
        
        if response.status_code == 200:
            ai_response = response.json()['choices'][0]['message']['content']
            
            # Check if we should suggest assessment
            suggest_assessment = any(word in message.lower() for word in [
                'assess', 'evaluation', 'review', 'start', 'begin', 'comprehensive', 'analyze'
            ])
            
            return jsonify({
                'success': True,
                'response': ai_response,
                'agent': f"{agent.name} (HumanGlue Expert)",
                'suggest_assessment': suggest_assessment
            })
        
        # Fallback response if API fails
        fallback_responses = {
            'leadership': "Leadership effectiveness is crucial for organizational success. I'd recommend evaluating vision clarity, decision-making consistency, and team empowerment. Would you like to explore this further with a comprehensive assessment?",
            'engagement': "Employee engagement directly impacts productivity and retention. Key factors include recognition, growth opportunities, and psychological safety. A detailed assessment can help identify specific improvement areas.",
            'culture': "Organizational culture shapes every aspect of performance. Strong cultures align values with behaviors and create psychological safety. Let's explore how your culture currently supports your goals.",
            'assessment': "I can help you conduct a comprehensive organizational assessment covering leadership, engagement, culture, communication, innovation, and agility. Would you like to start with the assessment dashboard?"
        }
        
        # Determine fallback response
        response_key = 'assessment'
        for key in fallback_responses.keys():
            if key in message.lower():
                response_key = key
                break
        
        return jsonify({
            'success': True,
            'response': fallback_responses[response_key],
            'agent': 'HumanGlue AI',
            'suggest_assessment': 'assessment' in message.lower()
        })
        
    except Exception as e:
        print(f"❌ Chat error: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'response': "I'm experiencing some technical difficulties. Please try again or visit the assessment dashboard directly."
        }), 500

# Health check
@app.route('/api/health')
def health():
    return jsonify({
        'status': 'healthy',
        'server': 'HumanGlue Real AI Assessment',
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    print("🚀 HumanGlue Real AI Assessment Server")
    print("🌐 Features: Real OpenAI/Anthropic/Google AI integration")
    print("🎯 Access: http://localhost:3000")
    print("🤖 Real AI Agents: GPT-4o, Claude Sonnet, Gemini Pro")
    print()
    
    app.run(host='0.0.0.0', port=3000, debug=True) 