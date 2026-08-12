# Dynamic Workflow

[中文](README.md)

> Dynamic workflow is included in newer agent-compose releases. Use recent, mutually compatible daemon, CLI, guest image, and runtime SDK versions that provide `workflowFile()`.

The sample handles an incident investigation whose graph size is unknown at deployment time. A planner derives 1–4 hypotheses from the actual failure domains. The runtime creates one investigator per hypothesis, after which an evidence judge may add 0–3 verification agents.

```text
incident
  → planner
  → N hypothesis investigators
  → evidence judge
  → 0..M follow-up verifiers
  → incident command report
```

Each run uses `3 + N + M` agents, where N and M come from structured outputs produced during the run.

## Problem addressed

A traditional scheduler event chain requires roles and topology to be registered at deployment time. Unknown branch counts otherwise require preallocated slots, correlation plumbing, empty-slot handling, aggregation, concurrency control, and custom failure and replay behavior.

Dynamic workflows let ordinary JavaScript construct the real graph from runtime arrays while providing:

- dynamic `pipeline()` and `parallel()` expansion;
- `phase()` progress;
- JSON Schema boundaries;
- stable invocation keys;
- a resume cache that reuses completed calls.

The incident domain is only a teaching vehicle. The pattern also fits dynamic code review, dataset fan-out, and expert selection based on a planner result.

## Files

- `agent-compose.yml`: scheduler entry point, sticky sandbox, and image build configuration.
- `workflows/incident-investigation.js`: reviewable workflow definition with Chinese prompts.
- `run-workflow.mjs`: dynamic workflow runtime SDK entry point.
- `Dockerfile`: packages workflow sources into the guest image.

## Build and run

Use mutually compatible recent daemon, CLI, `chaitin/agent-compose-guest:latest`, and runtime SDK versions, then run the following commands from this directory. `agent-compose.yml` declares the Docker build context, Dockerfile, and image tag, so `agent-compose up` builds `agent-compose-sample/dynamic-workflow:latest` without a separate `docker build` step.

```bash
agent-compose config --quiet
agent-compose up
agent-compose scheduler invoke incident_workflow --payload '{
  "incident": "Order latency increased after a deploy while database lock waits and downstream timeouts rose",
  "secondWave": "auto"
}'
```

Set `secondWave` to `auto`, `force`, or `skip`. Use the returned `runId` to demonstrate resume:

```bash
agent-compose scheduler invoke incident_workflow --payload '{
  "incident": "Order latency increased after a deploy while database lock waits and downstream timeouts rose",
  "secondWave": "auto",
  "resumeRunId": "<workflow-run-id>"
}'
```

## Expected result and cleanup

Output includes actual agent, hypothesis, and follow-up counts, invocation statuses, and the final report. The workflow proposes evidence collection and safe actions but never accesses production.

```bash
agent-compose scheduler logs --scheduler incident_workflow
agent-compose down
```
