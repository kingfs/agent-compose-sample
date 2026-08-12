# agent-compose Samples

[中文](README.md)

This repository contains runnable and readable examples for [agent-compose](https://github.com/chaitin/agent-compose). They serve as tutorials and as reference projects for chat, scheduling, event-driven collaboration, and dynamic workflows.

## Documentation and development

See [`docs/README.en.md`](docs/README.en.md) ([中文](docs/README.md)) for the repository layout, GitHub Pages publishing, local documentation builds, and contribution checks.

## Samples

| Sample | Level | What it demonstrates |
| --- | --- | --- |
| [chat-agent](agents/chat-agent/README.en.md) | Beginner | Start a chat assistant through the daemon CLI or Connect API |
| [scheduled-agent](agents/scheduled-agent/README.en.md) | Beginner | Run one agent from cron, interval, timeout, and event triggers |
| [event-driven-workflow](agents/event-driven-workflow/README.en.md) | Intermediate | Chain analysis, implementation advice, and test advice across three agents |
| [dynamic-workflow](agents/dynamic-workflow/README.en.md) | Intermediate | Expand a parallel agent graph from runtime results |
| [agent-creator](agents/agent-creator/README.en.md) | Intermediate | Create, validate, and import projects from natural-language requirements |

## Prepare agent-compose

Follow the [official agent-compose documentation](https://github.com/chaitin/agent-compose) to deploy the daemon, install the `agent-compose` CLI, and configure at least one model provider. Docker samples also require Docker access from the daemon.

Verify that the CLI can reach the daemon:

```bash
agent-compose version
agent-compose --host http://127.0.0.1:7410 version
```

Adjust `--host` and authentication environment variables for your deployment. Commands in sample documentation are run from the sample directory unless stated otherwise.

## Run a sample

Except for documented image-build steps, samples follow the same lifecycle:

```bash
cd agents/chat-agent
agent-compose config --quiet
agent-compose up
agent-compose run chat --prompt "Introduce yourself"
agent-compose logs chat
agent-compose down
```

Each sample README explains its triggers, design, expected result, and cleanup steps.

> `dynamic-workflow` uses the dynamic workflow capability included in newer agent-compose releases. Use mutually compatible recent daemon, CLI, guest image, and runtime SDK versions.

## Repository Skill

The repository Skill lives at [`.agents/skills/create-agent-compose-agents`](.agents/skills/create-agent-compose-agents/SKILL.md). AI coding agents with Skills support can use it to design, generate, and validate agent-compose examples. See [AGENTS.md](AGENTS.md) for repository instructions.

## Contribution rules

- Teach one primary concept per sample and prefer the smallest runnable configuration.
- Include both `README.md` and `README.en.md` in every sample.
- Never commit credentials, private hosts, machine-specific absolute paths, fixed run IDs, or experimental model names.
- Reference secrets through environment variables and commit only safe `.env.example` placeholders.
- Run `agent-compose config --quiet` before submitting; label experimental version or PR dependencies explicitly.

## License

[Apache License 2.0](LICENSE)
