# Mind Reasoner Documentation

Mind Reasoner creates psychometrically accurate digital twins from conversation transcripts. This documentation covers the MCP integration, API reference, and HumanGlue-specific implementation details.

## Overview

Mind Reasoner allows you to:
- Create digital minds from conversation transcripts
- Run simulations to predict how people will respond
- Analyze communication patterns and psychometrics
- Integrate with meeting platforms (Gong, Fathom, Fireflies, Zoom)

## Documentation Structure

- [MCP Server Setup](./mcp-setup.md) - How to connect Mind Reasoner MCP to Claude
- [Core Concepts](./core-concepts.md) - Minds, Snapshots, and Simulations
- [API Reference](./api-reference.md) - Direct REST API endpoints
- [MCP Tools Reference](./mcp-tools.md) - All available MCP tools
- [Neo4j Integration](./neo4j-integration.md) - Storing psychometric profiles in graph database
- [HumanGlue Integration](./humanglue-integration.md) - How we use Mind Reasoner in HumanGlue

## Quick Links

- **MCP Server Endpoint**: `https://mcp.mindreasoner.com/mcp`
- **API Base URL**: `https://app.mindreasoner.com/api/public/v1`
- **Dashboard**: https://app.mindsim.com
- **Official Docs**: https://docs.workflows.com
- **Support**: support@mindreasoner.com

## Key Use Cases for HumanGlue

1. **Prospect Profiling** - Build digital twins of prospects from video call transcripts
2. **Communication Optimization** - Simulate how prospects will respond to outreach
3. **Team Assessment** - Analyze team members' communication styles
4. **Client Success** - Predict client satisfaction and churn risk
