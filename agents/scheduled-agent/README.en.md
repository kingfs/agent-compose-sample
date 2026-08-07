# Scheduled Agent

[中文](README.md)

This sample runs the same agent through four paths: cron, recurring interval, one-shot startup timeout, and an external event.

## How it works

Four declarative triggers invoke `assistant` with different prompts. This pattern fits tasks whose logic is identical but whose timing or source differs. Use `scheduler.script` when you need conditional routing, state, or cross-agent orchestration.

```text
cron ─────┐
interval ─┤
timeout ──┼→ assistant agent
event ────┘
```

## Start and inspect

```bash
agent-compose config --quiet
agent-compose up
agent-compose scheduler ls assistant
```

`startup-reminder` runs once about 30 seconds after scheduler startup. Cron and interval triggers run over time. During development, invoke any path manually:

```bash
agent-compose scheduler trigger assistant hourly-status
agent-compose scheduler trigger assistant recurring-heartbeat
agent-compose scheduler trigger assistant startup-reminder
agent-compose scheduler trigger assistant external-event \
  --payload '{"source":"manual-demo"}'
```

Production integrations can publish topic `sample.scheduled-agent.run`. Webhook source setup and authentication depend on the daemon deployment; see the agent-compose webhook documentation.

## Expected result and cleanup

Responses identify the trigger path while all runs use the same `assistant` agent.

```bash
agent-compose scheduler runs assistant
agent-compose scheduler logs --scheduler assistant
agent-compose down
```

