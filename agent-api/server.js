// Import necessary dependencies
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { runAgent } from "./agent.js";

// Load environment variables
dotenv.config();

// Check if OpenAI API key is available
if (!process.env.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY is not set. Please add it to your .env file");
  process.exit(1);
}

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Agent API is running" });
});

// Route to run the agent
app.post("/api/agent/run", async (req, res) => {
  try {
    const { query, agentType = "basic", options = {} } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: "Query is required",
      });
    }

    console.log(
      `Received request to run ${agentType} agent with query: ${query}`
    );

    const result = await runAgent(query, agentType, options);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in /api/agent/run:", error);
    return res.status(500).json({
      success: false,
      error: `Server error: ${error.message}`,
    });
  }
});

// Create an endpoint that supports Arcade's tool calling format
app.post("/api/agent/tool", async (req, res) => {
  try {
    const { name, arguments: args } = req.body;

    if (name !== "runAgent") {
      return res.status(400).json({
        success: false,
        error: `Unknown tool: ${name}`,
      });
    }

    const { query, agentType = "basic", options = {} } = args;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: "Query parameter is required",
      });
    }

    console.log(`Received tool call request: ${name} with query: ${query}`);

    const result = await runAgent(query, agentType, options);

    return res.status(200).json({
      ...result,
      toolName: name,
      toolArgs: args,
    });
  } catch (error) {
    console.error("Error in /api/agent/tool:", error);
    return res.status(500).json({
      success: false,
      error: `Server error: ${error.message}`,
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Agent API server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
  console.log(
    `Agent endpoint available at http://localhost:${PORT}/api/agent/run`
  );
  console.log(
    `Tool calling endpoint available at http://localhost:${PORT}/api/agent/tool`
  );
});
