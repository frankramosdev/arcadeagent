// Import necessary dependencies
import { ChatOpenAI } from "@langchain/openai";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { Calculator } from "@langchain/community/tools/calculator";
import { WebBrowser } from "@langchain/community/tools/webbrowser";
import { OpenAIEmbeddings } from "@langchain/openai";
import { DynamicTool } from "@langchain/core/tools";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Check if OpenAI API key is provided
if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is required");
}

// Create a custom tool
const weatherTool = new DynamicTool({
  name: "getCurrentWeather",
  description: "Get the current weather in a given location",
  func: async (location) => {
    // In a real app, you would call a weather API here
    return `The current weather in ${location} is 72°F and sunny.`;
  },
});

// Define the agent executor function
export const runAgent = async (query) => {
  try {
    // Initialize the language model
    const model = new ChatOpenAI({
      temperature: 0,
      modelName: "gpt-3.5-turbo",
    });

    const embeddings = new OpenAIEmbeddings();

    // Initialize tools
    const tools = [
      new Calculator(),
      weatherTool,
      new WebBrowser({ model, embeddings }),
    ];

    // Initialize the agent with the tools and the language model
    const executor = await initializeAgentExecutorWithOptions(tools, model, {
      agentType: "chat-zero-shot-react-description",
      verbose: true,
    });

    console.log("Agent initialized. Processing query:", query);

    // Run the agent
    const result = await executor.invoke({
      input: query,
    });

    console.log("Agent execution completed.");
    return result.output;
  } catch (error) {
    console.error("Error running agent:", error);
    throw error;
  }
};

// Main function to demonstrate agent usage
const main = async () => {
  try {
    const query =
      process.argv[2] ||
      "What's the weather in New York and calculate 25 * 48.";
    console.log("Running agent with query:", query);

    const result = await runAgent(query);
    console.log("\nResult:", result);
  } catch (error) {
    console.error("Error in main function:", error);
  }
};

// Run the main function if this file is being executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  main();
}
