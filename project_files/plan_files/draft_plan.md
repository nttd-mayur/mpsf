# Plan: Agentic JMeter Script Generation System

## Summary
Build the existing React + Express starter into a guided JMeter pack generator for **HTTP/API testing**. Users submit a **structured test definition** through the UI, the backend performs **strict schema validation**, then a **multi-agent pipeline** produces a reviewed test design and, after approval, generates a **downloadable bundle** containing:
- a stock-compatible `.jmx`
- schema-derived input files such as `.csv` and config files
- generation metadata for traceability

The workflow is: **collect input -> validate -> agent design pass -> preview/approve -> agent generation pass -> download bundle**.

## Key Changes
### 1. Product flow
- Replace the current single free-text “goal” flow with a **structured test-definition form**.
- Required v1 inputs should cover:
  - test name and objective
  - base URL / environment
  - endpoint list with method, path, headers, params, body shape
  - authentication strategy
  - assertions / success criteria
  - load profile (threads, ramp-up, duration/iterations)
  - test data schema for input-file generation
- Add a **preview step** that shows the interpreted test design, validation issues, and generated artifact list before final generation.
- Final step returns a **download bundle**, not just JSON text.

### 2. Multi-agent backend pipeline
Implement the backend as a deterministic orchestration layer around specialized agents:
- **Validation Agent**: checks completeness, contradictions, ambiguous fields, and missing required values after schema validation.
- **Test Design Agent**: converts validated input into an internal JMeter test-plan spec.
- **Data File Agent**: creates CSV/config content from the provided data schema, defaults, and sample values.
- **JMX Assembly Agent**: converts the internal spec into a stock-JMeter-compatible `.jmx`.
- Keep orchestration deterministic: agent outputs should map into typed intermediate objects, not free-form strings.

### 3. Deterministic guardrails
- Put **Zod-backed request validation** in front of every agent step.
- Use a typed internal representation for:
  - test definition input
  - validated design spec
  - generated artifact manifest
- Prefer **template/rule-driven JMX assembly** for stable XML structure, with agents filling spec content rather than directly emitting uncontrolled XML.
- Enforce **stock JMeter compatibility** in v1: no plugin-only samplers or listeners.

### 4. Frontend experience
- Redesign the UI around a work-focused generator, not a generic planner.
- Main views:
  - input form
  - validation results
  - design preview / approval
  - artifact summary / download
- Show field-level validation clearly and keep generation state transparent: `Draft`, `Validated`, `Needs fixes`, `Ready for approval`, `Generated`.

## Public APIs / Interfaces
### Backend API
Replace or extend `POST /api/agent/run` with a workflow-oriented API:
- `POST /api/test-definitions/validate`
  - input: structured test definition
  - output: normalized input, validation issues, readiness status
- `POST /api/test-definitions/preview`
  - input: validated definition
  - output: interpreted JMeter design spec and planned artifact manifest
- `POST /api/test-definitions/generate`
  - input: approved definition/spec
  - output: generated artifact metadata and bundle reference or streamed download
- Optional:
  - `GET /api/test-definitions/templates`
  - `GET /api/health`

### Internal types
Define explicit types for:
- `TestDefinitionRequest`
- `ValidationIssue`
- `ValidatedTestDefinition`
- `JMeterDesignSpec`
- `GeneratedArtifact`
- `GenerationBundleManifest`

## Test Plan
- Schema validation:
  - missing required fields
  - invalid HTTP methods
  - malformed URLs
  - contradictory load settings
  - missing data-schema details for required CSV generation
- Agent pipeline:
  - validation agent flags ambiguity correctly
  - design agent maps endpoints/assertions/load profile into the internal spec
  - data-file agent produces expected columns and row shapes
  - JMX assembly produces parseable XML with expected thread groups, samplers, config elements, and assertions
- Compatibility:
  - generated `.jmx` opens in stock JMeter
  - generated bundle contains all referenced files
  - CSV/config filenames match JMX references
- UX flow:
  - invalid input blocks preview/generation
  - preview requires explicit approval
  - successful generation exposes downloadable artifacts

## Assumptions
- v1 is **HTTP/API only**.
- Users provide **structured form input**, not prompt-only requests.
- Supporting files are **generated from a declared schema**, not uploaded datasets.
- Artifacts are delivered as a **downloadable bundle**.
- Validation is **strict** and blocks generation when core inputs are incomplete or contradictory.
- This plan uses the current repo split:
  - `frontend` for the multi-step generator UI
  - `backend` for validation, agent orchestration, and artifact generation
- Your upcoming “system details” will be used to finalize the exact input schema and JMX feature coverage, but the architecture above stays the default unless those details require a narrower scope.
