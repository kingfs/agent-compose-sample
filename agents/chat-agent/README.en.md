# Chat Agent

[中文](README.md)

This minimal chat assistant shows that the same agent-compose project can be invoked through either the daemon CLI or its Connect RPC HTTP API.

## Scenario and problem addressed

Start here when validating provider configuration, building a minimal chat entry point, or letting an existing service call an agent over HTTP. The sample deliberately uses one stateless, tool-free agent so it answers the first integration question—whether a CLI or API request can reach the model and return a result—without introducing scheduling, workspaces, or multi-agent orchestration.

## How it works

`agent-compose.yml` defines one `chat` agent. For each request, the daemon starts `agent-compose-guest` in a Docker sandbox and sends the user prompt to the configured `codex` provider. The deployment selects the model; the sample does not pin one.

```text
CLI / Connect API → agent-compose daemon → chat agent → model provider
```

## Prerequisites

You need a working agent-compose daemon and CLI, a configured `codex` provider, and Docker access to pull `chaitin/agent-compose-guest:latest`.

## Start

```bash
agent-compose config --quiet
agent-compose up
agent-compose run chat --prompt "Explain agent-compose in three sentences"
```

For an interactive conversation:

```bash
agent-compose run -it chat --prompt "Hello. Please introduce yourself first."
```

## Call the daemon API

Obtain the deployed `projectId` from `agent-compose up --json` or `agent-compose inspect project chat-agent --json`, then call the unary Connect RPC method:

```bash
export AGENT_COMPOSE_HOST=http://127.0.0.1:7410
export PROJECT_ID='<project-id>'

curl -sS "$AGENT_COMPOSE_HOST/agentcompose.v2.RunService/RunAgent" \
  -H 'Content-Type: application/json' \
  -d "{\"projectId\":\"$PROJECT_ID\",\"agentName\":\"chat\",\"prompt\":\"What can you help me with?\"}"
```

Add the deployment-specific `Authorization` header when daemon authentication is enabled. `RunAgent` waits for completion; asynchronous clients can use `StartAgentRun` from the same service.

## Expected result and cleanup

The assistant should follow the user's language, remain concise, and avoid unsupported claims.

```bash
agent-compose logs chat
agent-compose down
```
