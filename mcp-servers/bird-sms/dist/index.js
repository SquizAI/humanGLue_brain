#!/usr/bin/env node
/**
 * Bird SMS MCP Server
 * Provides tools for interacting with Bird's messaging API
 * @see https://docs.bird.com/api/
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
// Bird API configuration from environment
const BIRD_API_KEY = process.env.BIRD_API_KEY;
const BIRD_WORKSPACE_ID = process.env.BIRD_WORKSPACE_ID;
const BIRD_CHANNEL_ID = process.env.BIRD_CHANNEL_ID;
const BIRD_BASE_URL = 'https://api.bird.com';
// Define available tools
const TOOLS = [
    {
        name: 'bird_send_sms',
        description: 'Send an SMS message using Bird API',
        inputSchema: {
            type: 'object',
            properties: {
                to: {
                    type: 'string',
                    description: 'Phone number to send SMS to (E.164 format, e.g., +17077066620)',
                },
                message: {
                    type: 'string',
                    description: 'The text message content to send',
                },
                channelId: {
                    type: 'string',
                    description: 'Optional: Override the default Bird channel ID',
                },
            },
            required: ['to', 'message'],
        },
    },
    {
        name: 'bird_send_via_navigator',
        description: 'Send an SMS message using Bird Navigator (for conversation flows)',
        inputSchema: {
            type: 'object',
            properties: {
                navigatorId: {
                    type: 'string',
                    description: 'The Bird Navigator ID to use for routing',
                },
                to: {
                    type: 'string',
                    description: 'Phone number to send SMS to (E.164 format)',
                },
                message: {
                    type: 'string',
                    description: 'The text message content to send',
                },
            },
            required: ['navigatorId', 'to', 'message'],
        },
    },
    {
        name: 'bird_get_message',
        description: 'Get details of a sent message by ID',
        inputSchema: {
            type: 'object',
            properties: {
                messageId: {
                    type: 'string',
                    description: 'The Bird message ID to retrieve',
                },
                channelId: {
                    type: 'string',
                    description: 'Optional: Override the default Bird channel ID',
                },
            },
            required: ['messageId'],
        },
    },
    {
        name: 'bird_list_channels',
        description: 'List available messaging channels in the workspace',
        inputSchema: {
            type: 'object',
            properties: {},
            required: [],
        },
    },
    {
        name: 'bird_list_navigators',
        description: 'List available navigators in the workspace',
        inputSchema: {
            type: 'object',
            properties: {},
            required: [],
        },
    },
    {
        name: 'bird_get_workspace_info',
        description: 'Get information about the current Bird workspace',
        inputSchema: {
            type: 'object',
            properties: {},
            required: [],
        },
    },
    {
        name: 'bird_send_template',
        description: 'Send a pre-approved message template (useful for WhatsApp Business)',
        inputSchema: {
            type: 'object',
            properties: {
                to: {
                    type: 'string',
                    description: 'Phone number to send to (E.164 format)',
                },
                templateId: {
                    type: 'string',
                    description: 'The ID of the message template to use',
                },
                parameters: {
                    type: 'object',
                    description: 'Template parameters as key-value pairs',
                    additionalProperties: { type: 'string' },
                },
                channelId: {
                    type: 'string',
                    description: 'Optional: Override the default Bird channel ID',
                },
            },
            required: ['to', 'templateId'],
        },
    },
];
// Helper function to make Bird API requests
async function birdRequest(endpoint, method = 'GET', body) {
    if (!BIRD_API_KEY) {
        throw new Error('BIRD_API_KEY environment variable is not set');
    }
    if (!BIRD_WORKSPACE_ID) {
        throw new Error('BIRD_WORKSPACE_ID environment variable is not set');
    }
    const url = `${BIRD_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
        method,
        headers: {
            'Authorization': `AccessKey ${BIRD_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(`Bird API error (${response.status}): ${JSON.stringify(data)}`);
    }
    return data;
}
// Format phone number to E.164
function formatPhoneNumber(phone) {
    const cleaned = phone.replace(/[^\d+]/g, '');
    return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
}
// Create the MCP server
const server = new Server({
    name: 'bird-sms-mcp-server',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
    },
});
// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: TOOLS };
});
// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        switch (name) {
            case 'bird_send_sms': {
                const { to, message, channelId } = args;
                const channel = channelId || BIRD_CHANNEL_ID;
                if (!channel) {
                    throw new Error('No channel ID provided and BIRD_CHANNEL_ID is not set');
                }
                const result = await birdRequest(`/workspaces/${BIRD_WORKSPACE_ID}/channels/${channel}/messages`, 'POST', {
                    receiver: {
                        contacts: [{ identifierValue: formatPhoneNumber(to) }],
                    },
                    body: {
                        type: 'text',
                        text: { text: message },
                    },
                });
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            case 'bird_send_via_navigator': {
                const { navigatorId, to, message } = args;
                const result = await birdRequest(`/workspaces/${BIRD_WORKSPACE_ID}/navigators/${navigatorId}/messages`, 'POST', {
                    receiver: {
                        contacts: [{ identifierValue: formatPhoneNumber(to) }],
                    },
                    body: {
                        type: 'text',
                        text: { text: message },
                    },
                });
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            case 'bird_get_message': {
                const { messageId, channelId } = args;
                const channel = channelId || BIRD_CHANNEL_ID;
                if (!channel) {
                    throw new Error('No channel ID provided and BIRD_CHANNEL_ID is not set');
                }
                const result = await birdRequest(`/workspaces/${BIRD_WORKSPACE_ID}/channels/${channel}/messages/${messageId}`);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            case 'bird_list_channels': {
                const result = await birdRequest(`/workspaces/${BIRD_WORKSPACE_ID}/channels`);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            case 'bird_list_navigators': {
                const result = await birdRequest(`/workspaces/${BIRD_WORKSPACE_ID}/navigators`);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            case 'bird_get_workspace_info': {
                const result = await birdRequest(`/workspaces/${BIRD_WORKSPACE_ID}`);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            case 'bird_send_template': {
                const { to, templateId, parameters, channelId } = args;
                const channel = channelId || BIRD_CHANNEL_ID;
                if (!channel) {
                    throw new Error('No channel ID provided and BIRD_CHANNEL_ID is not set');
                }
                const result = await birdRequest(`/workspaces/${BIRD_WORKSPACE_ID}/channels/${channel}/messages`, 'POST', {
                    receiver: {
                        contacts: [{ identifierValue: formatPhoneNumber(to) }],
                    },
                    body: {
                        type: 'template',
                        template: {
                            templateId,
                            parameters: parameters || {},
                        },
                    },
                });
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            content: [
                {
                    type: 'text',
                    text: `Error: ${errorMessage}`,
                },
            ],
            isError: true,
        };
    }
});
// Start the server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Bird SMS MCP Server running on stdio');
}
main().catch(console.error);
