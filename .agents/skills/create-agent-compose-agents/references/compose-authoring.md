# Compose authoring contract

Use the authoring shape below and omit unused fields:

```yaml
name: project-name
env_file: .env
variables:
  API_TOKEN:
    value: ${API_TOKEN}
    secret: true
workspaces:
  source:
    provider: git
    url: https://example.com/repository.git
    branch: main
    path: .
volumes:
  cache: {}
agents:
  worker:
    provider: codex
    image: chaitin/agent-compose-guest:latest
    system_prompt: |
      Stable role instructions.
    driver:
      docker: {}
    workspace:
      name: source
    volumes:
      - type: volume
        source: cache
        target: /cache
```

Important rules:

- Name-key `agents`, `workspaces`, `mcps`, and `volumes`.
- Reference secrets from environment variables.
- Use exactly one runtime driver and either a published `image` or valid `build` configuration.
- A daemon resolves local workspaces and build contexts on its own filesystem; prefer Git sources and published images for remote daemons.
- `up` sends normalized configuration, not arbitrary local files.

Use declarative triggers for direct prompt invocation:

```yaml
scheduler:
  enabled: true
  triggers:
    - name: daily-report
      cron: "0 9 * * 1-5"
      prompt: Generate the daily report.
```

Each trigger selects exactly one of `cron`, `interval`, `timeout`, or `event`. Use `scheduler.script` for routing, conditional workflows, state, execution timeouts, or multiple agent calls. Never configure both forms on one agent.

The real manual for the installed agent-compose version is authoritative when it differs from this concise reference.
