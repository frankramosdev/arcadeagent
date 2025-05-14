# LangChain.js Agent Workflow

This project demonstrates how to create and run a LangChain agent workflow using JavaScript.

## Features

- Uses LangChain.js for creating an agent workflow
- Implements multiple tools: Calculator, Custom Weather tool, and Web Browser
- Demonstrates how to use OpenAI models with LangChain
- Includes an advanced agent example with memory and chains

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

### Basic Agent

Run the basic agent with a default query:

```
npm start
```

Or provide a custom query:

```
npm start "What's the weather in San Francisco and calculate the square root of 144?"
```

### Advanced Agent

Run the advanced agent that includes memory and a summarization chain:

```
npm run start:advanced
```

Or provide a custom query:

```
npm run start:advanced "What can you tell me about recent stock market trends?"
```

## Project Structure

- `index.js` - Basic agent implementation
- `advanced-agent.js` - Advanced agent with memory and chains
- `package.json` - Project configuration and dependencies
- `.env` - Environment variables (API keys)

## Features Demonstrated

### Basic Agent (index.js)

- Simple agent with multiple tools
- Zero-shot agent type

### Advanced Agent (advanced-agent.js)

- Conversational agent with memory
- Custom database query tool
- Summarization chain
- Follow-up questions that use conversation history

## LangSmith Integration (Optional)

For enhanced tracing and debugging, you can use LangSmith:

1. Get a LangSmith API key from [langsmith.com](https://langsmith.com)
2. Add to your `.env` file:
   ```
   LANGCHAIN_TRACING_V2=true
   LANGCHAIN_API_KEY=your_langsmith_api_key_here
   ```

## Tools Used

1. **Calculator**: Performs mathematical calculations
2. **Custom Weather Tool**: Simulates retrieving weather data (basic agent)
3. **Database Query Tool**: Simulates database queries (advanced agent)
4. **Summarizer Tool**: Summarizes text using a chain (advanced agent)
5. **Web Browser**: Allows the agent to browse the web for information

## Extending the Project

### Adding New Tools

You can add more tools to the agent by creating new DynamicTool instances or using built-in tools from the LangChain.js library.

Example of adding a new custom tool:

```javascript
const myCustomTool = new DynamicTool({
  name: "toolName",
  description: "Description of what the tool does",
  func: async (input) => {
    // Tool implementation
    return "Result";
  },
});

// Add to tools array
const tools = [
  // ... existing tools
  myCustomTool,
];
```
