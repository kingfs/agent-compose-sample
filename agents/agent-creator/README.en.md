# Agent Creator

[中文](README.md)

Agent Creator turns a natural-language requirement into a minimal, maintainable agent-compose project and validates it with the real CLI. When explicitly requested, it can also import the generated project into the daemon.

## How it works

The repository-level [create-agent-compose-agents Skill](../../.agents/skills/create-agent-compose-agents/SKILL.md) contains design rules, Compose constraints, runtime references, and deterministic scripts. The image packages that Skill together with the `agent-compose` CLI:

```text
requirement
  → creator reads the Skill and designs roles
  → scaffold.mjs generates the base project
  → validate-project.mjs + agent-compose config validate it
  → optional: publish-project.mjs imports it into the daemon
```

Generated files live under `/workspace` in the creator sandbox. By default, generated projects avoid references to creator-local paths that the daemon cannot read.

## Build and start

The `agent-compose:latest` and `agent-compose-guest:latest` images must already exist. The Compose build context includes the repository-level Skill:

```bash
agent-compose config --quiet
agent-compose image build
agent-compose up
agent-compose run -it creator --prompt \
  "Create an agent-compose project that summarizes tasks at 9 AM on weekdays. Validate it but do not import it."
```

`AGENT_COMPOSE_HOST` defaults to `http://agent-compose:7410`, which fits the standard Docker Compose network. Change it in `agent-compose.yml` when the daemon uses another sandbox-reachable address. `127.0.0.1` inside a sandbox refers to the sandbox itself.

## Expected result and cleanup

Creator should report the output directory, files, validation level, missing provider or runtime requirements, and next commands. It must not describe static validation as runtime verification.

```bash
agent-compose logs creator
agent-compose down
```

Repository maintainers and other AI agents can also use `.agents/skills/create-agent-compose-agents` directly without running this sample.

