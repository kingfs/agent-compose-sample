# Agent Input and Output Schemas

[中文](README.md)

> This sample depends on the unreleased `agents.<name>.input_schema` and
> `agents.<name>.output_schema` fields. Use an agent-compose build that includes
> this feature.

## Scenario and purpose

This sample shows how to publish machine-readable input and output contracts for an agent, allowing external platforms to generate forms, document parameters, or plan integrations. The input schema is inline in the Compose file, while the output schema is loaded from a project-local JSON Schema file.

These fields are currently interface metadata. The daemon resolves, normalizes, and snapshots them during `up`, but it does not automatically reject invocation inputs or validate the agent's actual output against them. Callers that require enforcement should validate independently. A per-invocation output schema supplied through the run API retains its existing behavior.

## How it works

```text
agent-compose.yml ── input_schema (inline)
        │
        └────────── output_schema (file source)
                         │
                         ▼
             config/up resolves a snapshot
                         │
                         ▼
             external platforms read the contract
```

The project contains one `researcher` agent with no workspace or external tools. The deployment configures the `codex` provider and selects the model.

## Prerequisites

- An agent-compose CLI and daemon build containing agent input/output schemas;
- A configured `codex` provider;
- Docker access to pull `chaitin/agent-compose-guest:latest`.

## Validate and run

```bash
agent-compose config --quiet
agent-compose config --json
agent-compose up
agent-compose run researcher --prompt "Summarize three primary uses of JSON Schema"
```

`config --json` should contain the normalized `input_schema` and the complete resolved `output_schema`, rather than its file source descriptor. The provider determines the response content; declaring these schemas does not itself force JSON output.

## Cleanup

```bash
agent-compose down
```

