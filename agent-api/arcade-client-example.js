/**
 * This is an example of how to integrate the agent API with Arcade.
 *
 * In a real implementation, this would be part of your Arcade application.
 */

// Import fetch for Node.js versions that don't have it globally
import fetch from "node-fetch";

// Example function to call the agent API
async function callAgentAPI(query, agentType = "basic", options = {}) {
  try {
    const response = await fetch("http://localhost:3000/api/agent/tool", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "runAgent",
        arguments: {
          query,
          agentType,
          options,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error calling agent API:", error);
    throw error;
  }
}

// Example of tool configuration for Arcade
const toolConfig = {
  tools: [
    {
      type: "function",
      function: {
        name: "runAgent",
        description: "Run an AI agent to perform tasks and answer questions",
        parameters: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "The question or task for the agent to handle",
            },
            agentType: {
              type: "string",
              enum: ["basic", "advanced"],
              description:
                "The type of agent to use: basic (no memory) or advanced (with memory)",
            },
            options: {
              type: "object",
              properties: {
                modelName: {
                  type: "string",
                  description:
                    "The OpenAI model to use (e.g., gpt-3.5-turbo, gpt-4)",
                },
                temperature: {
                  type: "number",
                  description: "The temperature setting for the model (0-1)",
                },
              },
            },
          },
          required: ["query"],
        },
      },
    },
  ],
};

// Example usage
async function runExample() {
  try {
    console.log("Calling basic agent...");
    const basicResult = await callAgentAPI(
      "What's the weather in New York and calculate 25 * 48?",
      "basic"
    );
    console.log("Basic agent result:", basicResult.output);

    console.log("\nCalling advanced agent with memory...");
    const advancedResult = await callAgentAPI(
      "Tell me about the latest advancements in AI and summarize the key points.",
      "advanced",
      { modelName: "gpt-4" }
    );
    console.log("Advanced agent result:", advancedResult.output);

    // Example of a follow-up question to test memory (only works with advanced agent)
    console.log("\nAsking a follow-up question to advanced agent...");
    const followUpResult = await callAgentAPI(
      "What were the main points you just mentioned?",
      "advanced"
    );
    console.log("Follow-up result:", followUpResult.output);
  } catch (error) {
    console.error("Error in example:", error);
  }
}

// Run the example if this file is executed directly
if (
  typeof process !== "undefined" &&
  process.argv[1] === new URL(import.meta.url).pathname
) {
  console.log("Starting Arcade client example...");
  console.log(
    "Make sure the agent API server is running on http://localhost:3000"
  );
  runExample();
}
