// Import necessary dependencies
import { ChatOpenAI } from "@langchain/openai";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { Calculator } from "@langchain/community/tools/calculator";
import { WebBrowser } from "@langchain/community/tools/webbrowser";
import { OpenAIEmbeddings } from "@langchain/openai";
import { DynamicTool } from "@langchain/core/tools";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { BufferMemory } from "langchain/memory";
import { LLMChain } from "langchain/chains";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Check if OpenAI API key is provided
if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is required");
}

// Create a custom database query tool
const databaseTool = new DynamicTool({
  name: "queryDatabase",
  description:
    "Query a database for information. Input should be a SQL-like query description.",
  func: async (query) => {
    // In a real app, this would connect to your database
    console.log(`Simulating database query: ${query}`);
    return `Results for query "${query}": Sample data for demonstration purposes.`;
  },
});

// Create a summarization chain
const createSummaryChain = (llm) => {
  const summarizationPrompt = PromptTemplate.fromTemplate(
    "Summarize the following content in 1-2 sentences:\n\n{input}"
  );

  return RunnableSequence.from([
    summarizationPrompt,
    llm,
    new StringOutputParser(),
  ]);
};

// Define the agent executor function with memory
export const runAdvancedAgent = async (query) => {
  try {
    // Initialize the language model
    const model = new ChatOpenAI({
      temperature: 0,
      modelName: "gpt-3.5-turbo",
    });

    const embeddings = new OpenAIEmbeddings();

    // Create summarization chain
    const summarizeChain = createSummaryChain(model);

    // Create a tool that uses the summarization chain
    const summarizerTool = new DynamicTool({
      name: "summarizeTool",
      description: "Summarizes a long piece of text into a shorter summary.",
      func: async (text) => {
        return summarizeChain.invoke({ input: text });
      },
    });

    // Initialize tools
    const tools = [
      new Calculator(),
      databaseTool,
      summarizerTool,
      new WebBrowser({ model, embeddings }),
    ];

    // Set up memory
    const memory = new BufferMemory({
      returnMessages: true,
      memoryKey: "chat_history",
      inputKey: "input",
      outputKey: "output",
    });

    // Initialize the agent with the tools, language model, and memory
    const executor = await initializeAgentExecutorWithOptions(tools, model, {
      agentType: "chat-conversational-react-description",
      verbose: true,
      memory: memory,
    });

    console.log("Advanced agent initialized. Processing query:", query);

    // Run the agent
    const result = await executor.invoke({
      input: query,
    });

    console.log("Agent execution completed.");
    return result.output;
  } catch (error) {
    console.error("Error running advanced agent:", error);
    throw error;
  }
};

// Main function to demonstrate agent usage
const main = async () => {
  try {
    const query =
      process.argv[2] ||
      "Query our database for recent sales and summarize the findings.";
    console.log("Running advanced agent with query:", query);

    const result = await runAdvancedAgent(query);
    console.log("\nResult:", result);

    // Example of follow-up question to demonstrate memory
    if (!process.argv[2]) {
      console.log("\n--- Follow-up question to demonstrate memory ---");
      const followUpResult = await runAdvancedAgent(
        "What was the previous query about?"
      );
      console.log("\nFollow-up Result:", followUpResult);
    }
  } catch (error) {
    console.error("Error in main function:", error);
  }
};

// Run the main function if this file is being executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  main();
}
