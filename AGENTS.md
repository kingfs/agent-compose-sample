# AGENTS.md

## Repository purpose

This repository teaches agent-compose through small, runnable projects. Keep public examples portable, focused, and understandable without access to any private development environment.

## Required workflow

1. Read `.agents/skills/create-agent-compose-agents/SKILL.md` before creating or substantially changing an agent-compose project.
2. Load only the Skill references required by the change. Always read its authoring and validation references before editing `agent-compose.yml`.
3. Preserve one directory per example under `agents/<kebab-case-name>/`.
4. Keep `README.md` in Chinese as the default human documentation and `README.en.md` as its English counterpart.
5. Explain the purpose, architecture, trigger path, commands, expected result, prerequisites, and cleanup for every sample.
6. Run the repository checks appropriate to the change. At minimum, validate every changed `agent-compose.yml` with the installed CLI.

## Public-release rules

- Do not add private Git hosts, internal service names, local source-tree paths, credentials, real tokens, run IDs, spec hashes, or copied terminal transcripts.
- Do not pin a sample to a private or experimental model name. Use a supported provider and let deployment configuration choose the model.
- Use `agent-compose` in documentation, not a developer-machine binary path.
- Use `${ENV_NAME}` for secrets and provide only empty or clearly non-secret examples.
- Mark dependencies on unmerged upstream features prominently in both language versions.
- Do not claim that an agent changes files, calls tools, or executes diagnostics unless its workspace and permissions actually allow it.

## Layout

```text
agents/<name>/
├── agent-compose.yml
├── README.md
├── README.en.md
└── additional runtime files only when required
```

The reusable project-authoring Skill belongs under `.agents/skills/`, not inside one sample. `agent-creator` may package that repository-level Skill into its image.

## Validation

From each changed sample directory, run:

```bash
agent-compose config --quiet
```

Also run relevant JavaScript syntax checks, the Skill validator, and a representative runtime invocation when the required daemon, images, credentials, and upstream feature version are available. Report unavailable runtime checks honestly.

