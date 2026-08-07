# Event-driven Workflow

[中文](README.md)

This sample chains three independent agents through persistent events to produce analysis, implementation advice, and test advice. It is not tied to GitLab or GitHub, and the roles do not need to share a sandbox.

## Scenario and problem addressed

Imagine an engineering team receiving code-change requests from an issue tracker, service desk, or webhook every day. When one agent performs requirements analysis, implementation design, and test design in a single run, intermediate decisions are hard to observe. A failure often means restarting everything, and separate teams cannot easily consume individual stage results.

This sample establishes three event-connected responsibility boundaries. An analyst identifies goals, impact, and risk; an implementation designer turns that analysis into file-level advice; a test designer uses both earlier results to produce a prioritized verification plan. It demonstrates asynchronous decoupling, stage auditing, retries, and replacing one stage with a team's own agent. It is not an automatic coding pipeline because no repository or test environment is mounted.

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

One request flows through the system as follows:

1. An external system or manual command publishes `sample.code-change.requested`.
2. `analyst` consumes it and publishes `sample.code-change.analyzed` with its analysis.
3. `implementer` consumes that event and publishes `sample.code-change.implementation-designed`.
4. `tester` consumes the design event and returns the final test advice; `correlationId` links all stages of the request.

## Prerequisites

- A working agent-compose daemon and CLI;
- a configured `codex` provider;
- Docker access to pull `chaitin/agent-compose-guest:latest`.

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
