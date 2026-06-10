import OpenAI from "openai";
import { z } from "zod";
import { toolCatalog } from "./tools.js";

const runRequestSchema = z.object({
  goal: z.string().min(1),
});

export type AgentRunResponse = {
  mode: "mock" | "openai";
  summary: string;
  plan: Array<{
    title: string;
    detail: string;
  }>;
  suggestedTools: string[];
};

function buildFallbackPlan(goal: string): AgentRunResponse {
  return {
    mode: "mock",
    summary: `Prepared an initial execution path for: ${goal}`,
    plan: [
      {
        title: "Frame the mission",
        detail: "Clarify the operating objective, success conditions, and handoff expectations for the agent.",
      },
      {
        title: "Map the MCP surface",
        detail: "Identify which servers, resources, and tool contracts the agent needs before it can act reliably.",
      },
      {
        title: "Define the operating loop",
        detail: "Set the reasoning, tool-call, and response pattern so the agent can plan, act, and report cleanly.",
      },
    ],
    suggestedTools: toolCatalog.map((tool) => tool.id),
  };
}

export async function runAgent(input: unknown): Promise<AgentRunResponse> {
  const { goal } = runRequestSchema.parse(input);
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

  if (!apiKey) {
    return buildFallbackPlan(goal);
  }

  const client = new OpenAI({ apiKey });
  const response = await client.responses.create({
    model,
    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text: "You are designing execution plans for a web-based MCP AI agent. Return concise, structured JSON only.",
          },
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: `Goal: ${goal}\nAvailable tools: ${toolCatalog
              .map((tool) => `${tool.id}: ${tool.description}`)
              .join("; ")}`,
          },
        ],
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "agent_plan",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            summary: { type: "string" },
            plan: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  title: { type: "string" },
                  detail: { type: "string" },
                },
                required: ["title", "detail"],
              },
            },
            suggestedTools: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: ["summary", "plan", "suggestedTools"],
        },
      },
    },
  });

  const parsed = JSON.parse(response.output_text) as Omit<AgentRunResponse, "mode">;

  return {
    mode: "openai",
    summary: parsed.summary,
    plan: parsed.plan,
    suggestedTools: parsed.suggestedTools,
  };
}
