#!/usr/bin/env python3
"""
HumanGlue AI Assessment Platform - Quick Start
Enhanced demonstration of agentic AI capabilities
"""

import os
import sys
import webbrowser
import time
from threading import Timer

def open_browser():
    """Open web browser to the application"""
    webbrowser.open('http://localhost:8080')

def check_dependencies():
    """Check if required dependencies are available"""
    required_modules = ['flask', 'flask_socketio', 'flask_cors']
    missing = []
    
    for module in required_modules:
        try:
            __import__(module)
        except ImportError:
            missing.append(module)
    
    if missing:
        print("❌ Missing dependencies:", ', '.join(missing))
        print("📦 To install: pip install -r requirements.txt")
        print("🔧 Or run: pip install flask flask-socketio flask-cors")
        return False
    
    return True

def main():
    print("🚀 HumanGlue AI Assessment Platform")
    print("=" * 50)
    print("📊 Features:")
    print("  • Real-time AI agent coordination")
    print("  • Multi-dimensional organizational assessment")
    print("  • Sophisticated ROI calculations")
    print("  • Human Glue Toolbox recommendations")
    print("  • WebSocket communication")
    print("  • Advanced analytics dashboard")
    print()
    
    if not check_dependencies():
        sys.exit(1)
    
    print("✅ Dependencies satisfied")
    print("🌐 Starting server on http://localhost:8080")
    print("🤖 AI Agents: Gemini, GPT-4o, Claude Sonnet ready")
    print()
    print("⚡ Features to test:")
    print("  1. Begin Assessment - Experience the multi-dimensional framework")
    print("  2. Watch AI Agents - See real-time coordination between agents")
    print("  3. Review Results - Comprehensive scoring and insights")
    print("  4. Explore Toolbox - Prioritized recommendations")
    print("  5. ROI Calculator - Detailed financial projections")
    print("  6. Chat Assistant - AI-powered help and explanation")
    print()
    
    # Open browser after a short delay
    Timer(2.0, open_browser).start()
    
    # Import and run the server
    try:
        from server import app, socketio
        socketio.run(app, host='0.0.0.0', port=5000, debug=False)
    except ImportError:
        print("❌ Could not import server module")
        print("📁 Make sure you're in the assessment_dashboard directory")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n👋 Shutting down HumanGlue AI Assessment Platform")
        sys.exit(0)

if __name__ == '__main__':
    main() 