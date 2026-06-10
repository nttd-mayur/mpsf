export type ToolDefinition = {
  id: string;
  name: string;
  description: string;
  inputShape: string;
};

export type AgentStep = {
  title: string;
  detail: string;
};

export type AgentRunResponse = {
  mode: "mock" | "openai";
  summary: string;
  plan: AgentStep[];
  suggestedTools: string[];
};
