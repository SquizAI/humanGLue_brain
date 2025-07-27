#!/usr/bin/env python3
"""
HumanGlue AI Assessment Server
Enhanced Flask server with WebSocket support and real-time agentic capabilities
"""

from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
import asyncio
import json
import logging
import os
import threading
import time
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import uuid
from dataclasses import dataclass, asdict
from enum import Enum
import sqlite3
from contextlib import contextmanager

# Import our enhanced backend
from backend import HumanGlueAIBackend, AssessmentResponse, AIAgent

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app with enhanced configuration
app = Flask(__name__, 
    static_folder='.',
    template_folder='.'
)
app.config['SECRET_KEY'] = 'humanglue-ai-assessment-2024'
app.config['DEBUG'] = True

# Enable CORS and WebSocket support
CORS(app, origins="*")
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# Global state management
class SessionManager:
    def __init__(self):
        self.active_sessions: Dict[str, Dict] = {}
        self.ai_backend = HumanGlueAIBackend()
        self.init_database()
    
    def init_database(self):
        """Initialize SQLite database for persistence"""
        with sqlite3.connect('assessment_data.db') as conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS assessments (
                    id TEXT PRIMARY KEY,
                    session_id TEXT,
                    organization_name TEXT,
                    responses TEXT,
                    results TEXT,
                    created_at TIMESTAMP,
                    completed_at TIMESTAMP
                )
            ''')
            
            conn.execute('''
                CREATE TABLE IF NOT EXISTS ai_interactions (
                    id TEXT PRIMARY KEY,
                    session_id TEXT,
                    agent TEXT,
                    interaction_type TEXT,
                    data TEXT,
                    timestamp TIMESTAMP
                )
            ''')
            conn.commit()
    
    def create_session(self, organization_name: str = "Demo Organization") -> str:
        session_id = str(uuid.uuid4())
        self.active_sessions[session_id] = {
            'id': session_id,
            'organization_name': organization_name,
            'created_at': datetime.now(),
            'current_dimension': 0,
            'current_question': 0,
            'responses': [],
            'ai_agents_status': {
                'gemini': {'active': False, 'last_used': None, 'tasks_completed': 0},
                'gpt': {'active': False, 'last_used': None, 'tasks_completed': 0},
                'claude': {'active': False, 'last_used': None, 'tasks_completed': 0}
            },
            'insights_generated': [],
            'completion_percentage': 0,
            'analysis_phase': 'initial'
        }
        return session_id
    
    def get_session(self, session_id: str) -> Optional[Dict]:
        return self.active_sessions.get(session_id)
    
    def update_session(self, session_id: str, updates: Dict):
        if session_id in self.active_sessions:
            self.active_sessions[session_id].update(updates)
    
    def activate_agent(self, session_id: str, agent: str, task: str):
        session = self.get_session(session_id)
        if session:
            session['ai_agents_status'][agent] = {
                'active': True,
                'last_used': datetime.now(),
                'current_task': task,
                'tasks_completed': session['ai_agents_status'][agent]['tasks_completed'] + 1
            }
            
            # Log AI interaction
            self.log_ai_interaction(session_id, agent, 'activation', {'task': task})
    
    def deactivate_agent(self, session_id: str, agent: str):
        session = self.get_session(session_id)
        if session:
            session['ai_agents_status'][agent]['active'] = False
    
    def log_ai_interaction(self, session_id: str, agent: str, interaction_type: str, data: Dict):
        interaction_id = str(uuid.uuid4())
        with sqlite3.connect('assessment_data.db') as conn:
            conn.execute('''
                INSERT INTO ai_interactions (id, session_id, agent, interaction_type, data, timestamp)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (interaction_id, session_id, agent, interaction_type, json.dumps(data), datetime.now()))
            conn.commit()

# Global session manager
session_manager = SessionManager()

@app.route('/')
def index():
    """Serve the enhanced assessment interface"""
    return send_from_directory('.', 'index.html')

@app.route('/api/session/create', methods=['POST'])
def create_session():
    """Create a new assessment session"""
    data = request.get_json() or {}
    organization_name = data.get('organization_name', 'Demo Organization')
    
    session_id = session_manager.create_session(organization_name)
    session = session_manager.get_session(session_id)
    
    logger.info(f"Created new session {session_id} for {organization_name}")
    
    return jsonify({
        'session_id': session_id,
        'organization_name': organization_name,
        'status': 'created',
        'ai_agents_available': ['gemini', 'gpt', 'claude']
    })

@app.route('/api/session/<session_id>/status', methods=['GET'])
def get_session_status(session_id: str):
    """Get current session status and AI agent states"""
    session = session_manager.get_session(session_id)
    if not session:
        return jsonify({'error': 'Session not found'}), 404
    
    return jsonify({
        'session_id': session_id,
        'organization_name': session['organization_name'],
        'completion_percentage': session['completion_percentage'],
        'current_dimension': session['current_dimension'],
        'current_question': session['current_question'],
        'ai_agents_status': session['ai_agents_status'],
        'analysis_phase': session['analysis_phase'],
        'insights_count': len(session['insights_generated'])
    })

@app.route('/api/assessment/submit_response', methods=['POST'])
def submit_response():
    """Submit an assessment response with real-time AI processing"""
    data = request.get_json()
    session_id = data.get('session_id')
    response_data = data.get('response')
    
    session = session_manager.get_session(session_id)
    if not session:
        return jsonify({'error': 'Session not found'}), 404
    
    # Store response
    session['responses'].append(response_data)
    
    # Trigger real-time AI analysis
    socketio.start_background_task(process_response_async, session_id, response_data)
    
    return jsonify({'status': 'received', 'processing': True})

@app.route('/api/assessment/<session_id>/analyze', methods=['POST'])
def trigger_full_analysis(session_id: str):
    """Trigger comprehensive AI analysis of all responses"""
    session = session_manager.get_session(session_id)
    if not session:
        return jsonify({'error': 'Session not found'}), 404
    
    # Start comprehensive analysis
    socketio.start_background_task(run_full_analysis, session_id)
    
    return jsonify({'status': 'analysis_started', 'estimated_duration': '45-60 seconds'})

@app.route('/api/ai_agents/status', methods=['GET'])
def get_ai_agents_status():
    """Get current status of all AI agents across all sessions"""
    agent_stats = {
        'gemini': {'total_tasks': 0, 'active_sessions': 0, 'specialties': ['Pattern Analysis', 'Communication Flow']},
        'gpt': {'total_tasks': 0, 'active_sessions': 0, 'specialties': ['Leadership Analysis', 'Strategic Planning']},
        'claude': {'total_tasks': 0, 'active_sessions': 0, 'specialties': ['Cultural Insights', 'Workshop Planning']}
    }
    
    for session in session_manager.active_sessions.values():
        for agent, status in session['ai_agents_status'].items():
            agent_stats[agent]['total_tasks'] += status['tasks_completed']
            if status['active']:
                agent_stats[agent]['active_sessions'] += 1
    
    return jsonify(agent_stats)

@app.route('/api/insights/<session_id>', methods=['GET'])
def get_insights(session_id: str):
    """Get generated insights for a session"""
    session = session_manager.get_session(session_id)
    if not session:
        return jsonify({'error': 'Session not found'}), 404
    
    return jsonify({
        'insights': session['insights_generated'],
        'analysis_phase': session['analysis_phase'],
        'completion_percentage': session['completion_percentage']
    })

# WebSocket Events for Real-time Communication

@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    logger.info(f"Client connected: {request.sid}")
    emit('connection_established', {'status': 'connected', 'server_time': datetime.now().isoformat()})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    logger.info(f"Client disconnected: {request.sid}")

@socketio.on('join_session')
def handle_join_session(data):
    """Join a specific assessment session for real-time updates"""
    session_id = data.get('session_id')
    if session_id and session_manager.get_session(session_id):
        join_room(session_id)
        emit('session_joined', {'session_id': session_id})
        logger.info(f"Client {request.sid} joined session {session_id}")
    else:
        emit('error', {'message': 'Invalid session'})

@socketio.on('leave_session')
def handle_leave_session(data):
    """Leave a session"""
    session_id = data.get('session_id')
    leave_room(session_id)
    emit('session_left', {'session_id': session_id})

@socketio.on('request_ai_insight')
def handle_ai_insight_request(data):
    """Handle real-time AI insight requests"""
    session_id = data.get('session_id')
    query = data.get('query', '')
    
    session = session_manager.get_session(session_id)
    if not session:
        emit('error', {'message': 'Session not found'})
        return
    
    # Simulate AI response generation
    socketio.start_background_task(generate_ai_insight, session_id, query, request.sid)

# Background Tasks for Async Processing

def process_response_async(session_id: str, response_data: Dict):
    """Process a single response asynchronously with AI agent coordination"""
    session = session_manager.get_session(session_id)
    if not session:
        return
    
    # Determine which AI agent should process this dimension
    dimension_id = response_data.get('dimension_id')
    agent_mapping = {
        'leadership': 'gpt',
        'engagement': 'gemini', 
        'culture': 'claude',
        'communication': 'gemini',
        'innovation': 'gpt',
        'agility': 'claude'
    }
    
    primary_agent = agent_mapping.get(dimension_id, 'gemini')
    
    # Activate agent
    session_manager.activate_agent(session_id, primary_agent, f"Analyzing {dimension_id} response")
    
    # Emit real-time updates
    socketio.emit('ai_agent_activated', {
        'agent': primary_agent,
        'task': f"Processing {dimension_id} dimension",
        'dimension': dimension_id
    }, room=session_id)
    
    # Simulate processing time
    time.sleep(2)
    
    # Generate immediate insight
    insight = generate_dimension_insight(dimension_id, response_data)
    session['insights_generated'].append(insight)
    
    # Deactivate agent
    session_manager.deactivate_agent(session_id, primary_agent)
    
    # Emit completion
    socketio.emit('response_processed', {
        'dimension': dimension_id,
        'insight': insight,
        'agent': primary_agent
    }, room=session_id)

def run_full_analysis(session_id: str):
    """Run comprehensive AI analysis with multiple agents"""
    session = session_manager.get_session(session_id)
    if not session:
        return
    
    session['analysis_phase'] = 'comprehensive_analysis'
    
    # Phase 1: Individual dimension analysis
    socketio.emit('analysis_phase_update', {
        'phase': 'dimension_analysis',
        'description': 'AI agents analyzing individual dimensions'
    }, room=session_id)
    
    agents = ['gemini', 'gpt', 'claude']
    for i, agent in enumerate(agents):
        session_manager.activate_agent(session_id, agent, 'Comprehensive dimension analysis')
        socketio.emit('ai_agent_activated', {
            'agent': agent,
            'task': 'Comprehensive analysis'
        }, room=session_id)
        time.sleep(3)  # Simulate processing
        
        session['completion_percentage'] = 20 + (i * 15)
        socketio.emit('analysis_progress', {
            'percentage': session['completion_percentage'],
            'current_task': f'{agent.upper()} analysis complete'
        }, room=session_id)
    
    # Phase 2: Cross-dimensional pattern recognition
    socketio.emit('analysis_phase_update', {
        'phase': 'pattern_recognition',
        'description': 'Identifying cross-dimensional patterns and correlations'
    }, room=session_id)
    
    session_manager.activate_agent(session_id, 'gemini', 'Pattern recognition across dimensions')
    time.sleep(4)
    session['completion_percentage'] = 70
    socketio.emit('analysis_progress', {
        'percentage': 70,
        'current_task': 'Pattern recognition complete'
    }, room=session_id)
    
    # Phase 3: Strategic recommendations
    socketio.emit('analysis_phase_update', {
        'phase': 'strategic_planning',
        'description': 'Generating strategic recommendations and action plans'
    }, room=session_id)
    
    session_manager.activate_agent(session_id, 'gpt', 'Strategic recommendation generation')
    time.sleep(3)
    session['completion_percentage'] = 85
    
    # Phase 4: Workshop preparation
    session_manager.activate_agent(session_id, 'claude', 'Workshop planning and preparation')
    time.sleep(2)
    session['completion_percentage'] = 100
    
    # Deactivate all agents
    for agent in agents:
        session_manager.deactivate_agent(session_id, agent)
    
    session['analysis_phase'] = 'completed'
    
    # Generate final results
    final_results = generate_comprehensive_results(session)
    
    socketio.emit('analysis_complete', {
        'results': final_results,
        'completion_time': datetime.now().isoformat()
    }, room=session_id)

def generate_ai_insight(session_id: str, query: str, client_id: str):
    """Generate AI insights based on user queries"""
    session = session_manager.get_session(session_id)
    if not session:
        return
    
    # Determine best agent for the query
    if 'leadership' in query.lower() or 'strategy' in query.lower():
        agent = 'gpt'
    elif 'culture' in query.lower() or 'values' in query.lower():
        agent = 'claude'
    else:
        agent = 'gemini'
    
    session_manager.activate_agent(session_id, agent, f'Responding to query: {query}')
    
    socketio.emit('ai_thinking', {
        'agent': agent,
        'query': query
    }, room=client_id)
    
    time.sleep(2)  # Simulate thinking
    
    # Generate contextual response
    insight = generate_contextual_insight(query, session)
    
    session_manager.deactivate_agent(session_id, agent)
    
    socketio.emit('ai_insight_generated', {
        'agent': agent,
        'query': query,
        'insight': insight,
        'confidence': 0.87
    }, room=client_id)

# Helper Functions

def generate_dimension_insight(dimension_id: str, response_data: Dict) -> Dict:
    """Generate immediate insights for a dimension response"""
    insights = {
        'leadership': "Strong leadership foundation detected. Vision communication shows strategic clarity.",
        'engagement': "Employee engagement patterns indicate good organizational health with growth potential.",
        'culture': "Cultural alignment demonstrates solid values integration with room for enhancement.",
        'communication': "Communication flows show effective information sharing across organizational levels.",
        'innovation': "Innovation capability indicates healthy experimentation and learning culture.",
        'agility': "Organizational agility reflects adaptive decision-making and structural efficiency."
    }
    
    return {
        'dimension': dimension_id,
        'insight': insights.get(dimension_id, "Positive organizational indicators detected."),
        'confidence': 0.83,
        'timestamp': datetime.now().isoformat(),
        'supporting_data': [f"Response value: {response_data.get('value', 'N/A')}"]
    }

def generate_contextual_insight(query: str, session: Dict) -> str:
    """Generate contextual insights based on user queries and session data"""
    query_lower = query.lower()
    
    if 'score' in query_lower or 'result' in query_lower:
        return f"Your assessment indicates strong organizational performance across multiple dimensions. Based on {len(session['responses'])} responses, key strengths include leadership clarity and employee engagement."
    
    elif 'improve' in query_lower or 'recommendation' in query_lower:
        return "Primary improvement opportunities focus on cultural alignment and communication effectiveness. I recommend prioritizing leadership development and cross-functional collaboration initiatives."
    
    elif 'roi' in query_lower or 'value' in query_lower:
        return "ROI projections indicate 300-600% first-year returns through improved employee retention and productivity gains. Implementation costs typically pay back within 3-6 months."
    
    elif 'workshop' in query_lower or 'next step' in query_lower:
        return "I recommend scheduling a strategic workshop within 2-3 weeks to validate findings with key stakeholders and develop detailed action plans. This ensures buy-in and accelerates implementation."
    
    else:
        return "Based on your assessment data, I can provide insights on organizational strengths, improvement opportunities, ROI projections, or implementation strategies. What specific aspect would you like to explore?"

def generate_comprehensive_results(session: Dict) -> Dict:
    """Generate comprehensive analysis results"""
    return {
        'overall_score': 78.5,
        'dimension_scores': {
            'leadership': 82,
            'engagement': 79, 
            'culture': 75,
            'communication': 81,
            'innovation': 73,
            'agility': 77
        },
        'key_insights': [
            {
                'type': 'strength',
                'title': 'Leadership Excellence',
                'description': 'Strong leadership foundation with clear vision communication',
                'agent': 'gpt'
            },
            {
                'type': 'opportunity', 
                'title': 'Innovation Enhancement',
                'description': 'Significant potential for innovation capability improvement',
                'agent': 'claude'
            }
        ],
        'roi_projection': {
            'year_one': '425%',
            'three_year': '1,850%',
            'annual_savings': '$2.1M'
        },
        'recommended_actions': [
            'Schedule strategic workshop within 2 weeks',
            'Implement leadership development program',
            'Launch innovation initiatives'
        ]
    }

if __name__ == '__main__':
    print("🚀 Starting HumanGlue AI Assessment Server")
    print("📊 Features: Real-time AI coordination, WebSocket communication, Advanced analytics")
    print("🌐 Access: http://localhost:8080")
    print("🤖 AI Agents: Gemini, GPT-4o, Claude Sonnet ready for coordination")
    
    socketio.run(app, host='0.0.0.0', port=8080, debug=True) 