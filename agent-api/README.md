# LangChain.js Agent API for Arcade Integration

This API provides access to LangChain.js agents through a REST API, specifically designed for integration with Arcade's tool calling functionality.

## Features

- RESTful API for running LangChain.js agents
- Supports both basic and advanced agent types
- Custom endpoint for Arcade tool calling integration
- Built with Express.js and LangChain.js

## Prerequisites

- Node.js (v14 or newer)
- OpenAI API key

## Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

## Usage

### Starting the Server

```bash
npm start
```

For development with auto-restart:

```bash
npm run dev
```

### API Endpoints

#### Health Check

```
GET /health
```

Response:

```json
{
  "status": "ok",
  "message": "Agent API is running"
}
```

#### Run Agent (Standard REST Endpoint)

```
POST /api/agent/run
```

Request Body:

```json
{
  "query": "What's the weather in New York and calculate 25 * 48?",
  "agentType": "basic", // or "advanced"
  "options": {
    "modelName": "gpt-3.5-turbo",
    "temperature": 0,
    "verbose": true
  }
}
```

Response:

```json
{
  "output": "The weather in New York is 72°F and sunny. 25 * 48 = 1200.",
  "success": true
}
```

#### Tool Calling Endpoint (For Arcade Integration)

```
POST /api/agent/tool
```

Request Body:

```json
{
  "name": "runAgent",
  "arguments": {
    "query": "What's the weather in New York and calculate 25 * 48?",
    "agentType": "basic",
    "options": {
      "modelName": "gpt-3.5-turbo"
    }
  }
}
```

Response:

```json
{
  "output": "The weather in New York is 72°F and sunny. 25 * 48 = 1200.",
  "success": true,
  "toolName": "runAgent",
  "toolArgs": {
    "query": "What's the weather in New York and calculate 25 * 48?",
    "agentType": "basic",
    "options": {
      "modelName": "gpt-3.5-turbo"
    }
  }
}
```

## Arcade Integration

### Tool Configuration

To configure this API as a tool in Arcade, you'll need to set up the tool with the following configuration:

```json
{
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "runAgent",
        "description": "Run an AI agent to perform tasks and answer questions",
        "parameters": {
          "type": "object",
          "properties": {
            "query": {
              "type": "string",
              "description": "The question or task for the agent to handle"
            },
            "agentType": {
              "type": "string",
              "enum": ["basic", "advanced"],
              "description": "The type of agent to use: basic (no memory) or advanced (with memory)"
            },
            "options": {
              "type": "object",
              "properties": {
                "modelName": {
                  "type": "string",
                  "description": "The OpenAI model to use (e.g., gpt-3.5-turbo, gpt-4)"
                },
                "temperature": {
                  "type": "number",
                  "description": "The temperature setting for the model (0-1)"
                }
              }
            }
          },
          "required": ["query"]
        }
      }
    }
  ]
}
```

### Example Usage in Arcade

```javascript
// Example of how Arcade would call this tool
const response = await fetchWithRetry("http://localhost:3000/api/agent/tool", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "runAgent",
    arguments: {
      query: "What's the weather in New York and calculate 25 * 48?",
      agentType: "basic",
    },
  }),
});

const result = await response.json();
console.log(result.output);
```

## LangSmith Integration (Optional)

For enhanced tracing and debugging, you can use LangSmith:

1. Get a LangSmith API key from [langsmith.com](https://langsmith.com)
2. Add to your `.env` file:
   ```
   LANGCHAIN_TRACING_V2=true
   LANGCHAIN_API_KEY=your_langsmith_api_key_here
   ```

## Extending the Agent

### Adding New Tools

To add new tools to the agent, modify the `agent.js` file. Examples:

```javascript
// Add a new tool to the basic agent
const myNewTool = new DynamicTool({
  name: "myToolName",
  description: "Description of what the tool does",
  func: async (input) => {
    // Tool implementation
    return "Result";
  },
});

// Add to tools array
const tools = [
  // ... existing tools
  myNewTool,
];
```
