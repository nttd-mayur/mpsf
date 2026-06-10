# Plan: MCP-Based JMeter Script Factory from the Provided Designs

## Summary
Use the design flow as a **stage-gated script factory** with five product stages:
1. Input Collection
2. Load Model Generation
3. JMX Validation
4. JMX Analysis and Auto-Correct
5. Test Plan Update / Final JMX Packaging

Implement it as a **React frontend + orchestrator backend + MCP tool servers**. The backend remains the agent host, but all meaningful generation, validation, parsing, template lookup, and packaging capabilities are exposed as MCP tools/resources so agents operate through governed interfaces rather than direct ad hoc logic.

This matches the design intent in the screen flows and architecture image:
- strict validation before moving forward
- human approval gates between stages
- structured intermediate artifacts
- final executable JMeter package with supporting files and auditability

## Implementation Changes
### 1. Product workflow from the designs
Build the UI as a multi-stage workspace, not a single prompt box.
- **Input Collection**
  - Capture request metadata, scope, workload/SLA, environment, test data, and dependencies.
  - Persist structured outputs by section, with approval at the step/group level.
  - Produce normalized scenario JSON/YAML as the handoff artifact for downstream stages.
- **Load Model Generation**
  - Transform approved intake data into a reusable load model.
  - Show scenario mix, target users, throughput, pacing, ramp-up/down, duration, and SLA targets.
  - Require approval before enabling the JMX stages.
- **JMX Validation**
  - Accept recorded/generated JMX.
  - Parse XML structure and validate thread groups, samplers, config elements, controllers, assertions, timers, listeners, version compatibility, disabled items, and referenced data files.
  - Block progression on critical failures.
- **JMX Analysis & Auto-Correct**
  - Convert the validated JMX into a dependency/model view.
  - Classify issues and propose deterministic corrections.
  - Let the user approve corrective actions before creating a corrected JMX baseline.
- **Test Plan Update**
  - Map approved load model inputs into the corrected JMX.
  - Regenerate the executable test plan, linked CSV/config files, and readiness summary.
  - Produce the final JMeter package and audit manifest.

### 2. MCP server design
Split capabilities into focused MCP servers so the orchestrator can compose them safely.

**A. Scenario Intake MCP Server**
- Tools:
  - `intake.validate_definition`
  - `intake.normalize_definition`
  - `intake.build_scenario_model`
- Resources:
  - canonical scenario schema
  - field definitions
  - approval-state model

**B. Load Model MCP Server**
- Tools:
  - `load.generate_model`
  - `load.validate_model`
  - `load.summarize_capacity`
- Resources:
  - load model schema
  - workload formulas
  - SLA mapping rules

**C. JMeter Template MCP Server**
- Tools:
  - `template.select_jmeter_components`
  - `template.assemble_jmx`
  - `template.link_test_data`
- Resources:
  - approved JMeter XML fragments
  - component templates
  - naming standards
  - stock-JMeter compatibility rules

**D. JMX Validation MCP Server**
- Tools:
  - `jmx.parse`
  - `jmx.validate_structure`
  - `jmx.validate_runtime_compatibility`
  - `jmx.validate_data_references`
- Resources:
  - validation rule catalog
  - supported JMeter version policy
  - quality checklist definitions

**E. JMX Analysis MCP Server**
- Tools:
  - `analysis.build_dependency_graph`
  - `analysis.detect_smells`
  - `analysis.propose_fixes`
  - `analysis.apply_fix_set`
- Resources:
  - issue taxonomy
  - fix recipes
  - correction safety rules

**F. Artifact Package MCP Server**
- Tools:
  - `artifact.build_bundle`
  - `artifact.generate_manifest`
  - `artifact.generate_readme`
- Resources:
  - package layout standard
  - manifest schema
  - audit log schema

### 3. Agent orchestration
Run a **supervisor agent** in the backend that only plans and routes work through MCP tools. Keep final generation deterministic.

Agent roles:
- **Intake Agent**: reviews user input, flags ambiguity, requests missing fields.
- **Load Model Agent**: turns approved scenario data into a structured workload model.
- **Validation Agent**: interprets tool results, explains failures, and decides if progression is blocked.
- **Correction Agent**: translates analysis findings into an approved fix set.
- **Packaging Agent**: prepares final artifact metadata and handoff summary.

Guardrails:
- Agents never write raw JMX directly as free text.
- Agents produce typed intermediate specs.
- Actual `.jmx`, `.csv`, `.yaml/.json`, and manifest files are emitted by rule/template-backed MCP tools.
- Human approval remains required at the same stage boundaries shown in the designs.

### 4. Backend contracts
Replace the current single `/api/agent/run` flow with stage-aware APIs.

Core API surface:
- `POST /api/intake/validate`
- `POST /api/intake/approve`
- `POST /api/load-model/generate`
- `POST /api/load-model/approve`
- `POST /api/jmx/validate`
- `POST /api/jmx/analyze`
- `POST /api/jmx/apply-fixes`
- `POST /api/test-plan/generate`
- `POST /api/test-plan/approve`
- `GET /api/artifacts/:bundleId`

Key internal types:
- `IntakeDefinition`
- `ApprovalState`
- `ScenarioModel`
- `LoadModel`
- `JmxValidationReport`
- `JmxIssue`
- `ApprovedFixSet`
- `JMeterDesignSpec`
- `ArtifactManifest`

## Test Plan
- Intake validation catches missing mandatory fields, inconsistent SLA/load inputs, and incomplete dependency/data definitions.
- Approval gates prevent downstream generation until the required stage is approved.
- Load model generation produces stable scenario mixes and workload numbers from the same inputs.
- JMX validation catches malformed XML, missing config elements, bad references, incompatible versions, and unresolved CSV dependencies.
- Auto-correct only applies approved fixes and preserves unaffected parts of the script.
- Final test-plan generation produces:
  - valid `.jmx`
  - linked data/config files
  - manifest/readme/audit outputs
  - a package that opens in stock JMeter
- End-to-end test covers the happy path:
  intake -> load model -> validation -> correction -> final package.

## Delivery Phases
### Phase 1: Foundation
- Define canonical schemas for intake, load model, validation report, fix set, and artifact manifest.
- Implement the MCP servers for intake, load model, templates, and validation.
- Build the multi-step UI shell with approval-state persistence.

### Phase 2: MVP Script Builder
- Add deterministic JMeter template assembly.
- Support HTTP/API scenarios only.
- Generate executable JMX plus linked CSV/config assets and manifest.

### Phase 3: Pilot Readiness
- Add JMX analysis and approved auto-correction.
- Improve validation coverage using pilot feedback.
- Harden package traceability and audit history.

### Phase 4: Controlled AI Assistance
- Add optional AI help for requirement drafting, assertion suggestions, validation explanations, and README text.
- Keep final generation and validation rule-based.

## Assumptions
- Scope is **JMeter-first**; Gatling/k6 references in the architecture stay out of v1.
- Supported scenario family is **HTTP/API performance testing** in the first implementation.
- MCP is the control plane for generation/validation capabilities; the backend is the orchestrator, not the place where tool logic is hardcoded.
- Approval records, manifests, and validation reports are first-class artifacts.
- CTA/button wording from the mockups is not part of the implementation contract; the plan follows workflow and data behavior only.
