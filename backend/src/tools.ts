export type ToolDefinition = {
  id: string;
  name: string;
  description: string;
  inputShape: string;
};

export const toolCatalog: ToolDefinition[] = [
  {
    id: "context.fetch",
    name: "Context Fetch",
    description: "Loads relevant product, policy, or ticket context before planning.",
    inputShape: "{ query: string }",
  },
  {
    id: "mcp.search",
    name: "MCP Search",
    description: "Queries connected MCP servers for documents, resources, or memory.",
    inputShape: "{ intent: string, scope?: string }",
  },
  {
    id: "workflow.compose",
    name: "Workflow Compose",
    description: "Builds a structured execution plan with clear ownership and checkpoints.",
    inputShape: "{ goal: string, constraints?: string[] }",
  }
];
