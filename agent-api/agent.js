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

/**
 * Creates and configures a basic agent with tools
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} - The initialized agent executor
 */
export const createBasicAgent = async (options = {}) => {
  const {
    modelName = "gpt-3.5-turbo",
    temperature = 0,
    verbose = true,
  } = options;

  // Initialize the language model
  const model = new ChatOpenAI({
    temperature,
    modelName,
  });

  const embeddings = new OpenAIEmbeddings();

  // Create a custom weather tool
  const weatherTool = new DynamicTool({
    name: "getCurrentWeather",
    description: "Get the current weather in a given location",
    func: async (location) => {
      // In a real app, you would call a weather API here
      return `The current weather in ${location} is 72°F and sunny.`;
    },
  });

  // Initialize tools
  const tools = [
    new Calculator(),
    weatherTool,
    new WebBrowser({ model, embeddings }),
  ];

  // Initialize the agent with the tools and the language model
  const executor = await initializeAgentExecutorWithOptions(tools, model, {
    agentType: "chat-zero-shot-react-description",
    verbose,
  });

  return executor;
};

/**
 * Creates and configures an advanced agent with memory and custom tools
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} - The initialized agent executor
 */
export const createAdvancedAgent = async (options = {}) => {
  const {
    modelName = "gpt-3.5-turbo",
    temperature = 0,
    verbose = true,
  } = options;

  // Initialize the language model
  const model = new ChatOpenAI({
    temperature,
    modelName,
  });

  const embeddings = new OpenAIEmbeddings();

  // Create a summarization chain
  const summarizationPrompt = PromptTemplate.fromTemplate(
    "Summarize the following content in 1-2 sentences:\n\n{input}"
  );

  const summarizeChain = RunnableSequence.from([
    summarizationPrompt,
    model,
    new StringOutputParser(),
  ]);

  // Create a tool that uses the summarization chain
  const summarizerTool = new DynamicTool({
    name: "summarizeTool",
    description: "Summarizes a long piece of text into a shorter summary.",
    func: async (text) => {
      return summarizeChain.invoke({ input: text });
    },
  });

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
    verbose,
    memory,
  });

  return executor;
};

/**
 * Run the specified agent with a query
 * @param {string} query - The user query to process
 * @param {string} agentType - The type of agent to use (basic or advanced)
 * @param {Object} options - Additional options for agent configuration
 * @returns {Promise<Object>} - The result of the agent execution
 */
export const runAgent = async (query, agentType = "basic", options = {}) => {
  try {
    console.log(`Running ${agentType} agent with query:`, query);

    let executor;
    if (agentType === "advanced") {
      executor = await createAdvancedAgent(options);
    } else {
      executor = await createBasicAgent(options);
    }

    // Run the agent
    const result = await executor.invoke({
      input: query,
    });

    console.log("Agent execution completed.");
    return {
      output: result.output,
      success: true,
    };
  } catch (error) {
    console.error("Error running agent:", error);
    return {
      output: `Error executing agent: ${error.message}`,
      success: false,
      error: error.message,
    };
  }
};
