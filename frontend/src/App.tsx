import { FormEvent, useEffect, useState } from "react";
import type { AgentRunResponse, ToolDefinition } from "./types";

const starterGoal =
  "Design an MCP-backed support assistant that can triage requests, search docs, and draft next actions.";

export default function App() {
  const [goal, setGoal] = useState(starterGoal);
  const [tools, setTools] = useState<ToolDefinition[]>([]);
  const [result, setResult] = useState<AgentRunResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void fetch("/api/tools")
      .then((response) => response.json())
      .then((data: ToolDefinition[]) => setTools(data))
      .catch(() => setError("Unable to load the tool catalog."));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/agent/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ goal }),
      });

      if (!response.ok) {
        throw new Error("Agent run failed.");
      }

      const data: AgentRunResponse = await response.json();
      setResult(data);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Something went wrong while running the agent.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Web-based MCP AI agent starter</p>
          <h1>Plan, inspect, and evolve an agent from one control surface.</h1>
          <p className="lede">
            This starter pairs a lightweight browser UI with a backend orchestration
            layer so you can plug in real MCP servers, policies, and models.
          </p>
        </div>
        <div className="status-card">
          <span className="status-dot" />
          <div>
            <strong>Container-ready</strong>
            <p>Frontend and backend run as isolated services with a shared compose file.</p>
          </div>
        </div>
      </section>

      <section className="workspace">
        <form className="panel" onSubmit={handleSubmit}>
          <div className="panel-header">
            <h2>Mission input</h2>
            <span>{loading ? "Running" : "Idle"}</span>
          </div>
          <label className="field">
            <span>Agent goal</span>
            <textarea
              rows={7}
              value={goal}
              onChange={(event) => setGoal(event.target.value)}
              placeholder="Describe what the agent should achieve."
            />
          </label>
          <button className="primary-button" disabled={loading || !goal.trim()} type="submit">
            {loading ? "Working..." : "Run planner"}
          </button>
          {error ? <p className="error-text">{error}</p> : null}
        </form>

        <div className="stack">
          <section className="panel">
            <div className="panel-header">
              <h2>Tool catalog</h2>
              <span>{tools.length} loaded</span>
            </div>
            <ul className="tool-list">
              {tools.map((tool) => (
                <li key={tool.id}>
                  <div>
                    <strong>{tool.name}</strong>
                    <p>{tool.description}</p>
                  </div>
                  <code>{tool.inputShape}</code>
                </li>
              ))}
            </ul>
          </section>

          <section className="panel">
            <div className="panel-header">
              <h2>Agent output</h2>
              <span>{result?.mode ?? "No run yet"}</span>
            </div>
            {result ? (
              <div className="result">
                <p className="summary">{result.summary}</p>
                <ol className="plan-list">
                  {result.plan.map((step) => (
                    <li key={step.title}>
                      <strong>{step.title}</strong>
                      <p>{step.detail}</p>
                    </li>
                  ))}
                </ol>
                <div className="suggested-tools">
                  {result.suggestedTools.map((toolId) => (
                    <span key={toolId}>{toolId}</span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="empty-state">
                Submit a goal to generate an initial orchestration plan.
              </p>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
