# Event-driven Workflow

[中文](README.md)

This sample chains three independent agents through persistent events to produce analysis, implementation advice, and test advice. It is not tied to GitLab or GitHub, and the roles do not need to share a sandbox.

## How it works

```text
sample.code-change.requested
  → analyst
  → sample.code-change.analyzed
  → implementer
  → sample.code-change.implementation-designed
  → tester
```

Each role has its own system prompt and scheduler. Events carry a correlation ID, original request, and previous-stage output so stages remain observable and independently retryable. No source repository is mounted, so the implementer and tester provide advice without claiming to change code or run tests.

## Start

```bash
agent-compose config --quiet
agent-compose up
agent-compose scheduler ls
```

Invoke the entry handler manually:

```bash
agent-compose scheduler trigger analyst analyze-change --payload '{
  "correlationId": "demo-001",
  "title": "Add rate limiting to the login endpoint",
  "description": "Remain compatible with existing clients and return a recognizable error for limited requests"
}'
```

You can also configure a generic webhook source to publish external requests to `sample.code-change.requested`. Never hard-code webhook tokens in public configuration.

## Expected result

One entry event produces structured analysis, file-level implementation advice, and a layered test plan.

```bash
curl -sS 'http://127.0.0.1:7410/api/events?limit=20'
agent-compose scheduler runs
agent-compose logs
agent-compose down
```
