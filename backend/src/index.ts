import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { runAgent } from "./agent.js";
import { toolCatalog } from "./tools.js";

dotenv.config();

const app = express();
const port = 8787;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({
    ok: true,
    mode: process.env.OPENAI_API_KEY ? "openai-configured" : "mock-mode",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/tools", (_request, response) => {
  response.json(toolCatalog);
});

app.post("/api/agent/run", async (request, response) => {
  try {
    const result = await runAgent(request.body);
    response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    response.status(400).json({ error: message });
  }
});

app.listen(port, () => {
  console.log(`MCP agent backend listening on http://localhost:${port}`);
});
