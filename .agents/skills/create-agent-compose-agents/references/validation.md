# Validation and completion

Run checks in this order:

1. `node <skill>/scripts/validate-project.mjs <project-dir>`
2. `agent-compose --file <project-dir>/agent-compose.yml config --quiet`
3. If import was requested and the daemon is reachable, run `publish-project.mjs`.
4. Run the smallest representative prompt, command, or scheduler trigger when authorized.
5. Inspect runs and logs; verify structured output against its schema.
6. Clean up with `down` when resources should not persist.

Classify completion honestly:

- **Generated**: files exist but validation did not run.
- **Compose valid**: the installed CLI accepted the configuration.
- **Imported**: the daemon accepted `up`.
- **Runtime verified**: an authorized representative invocation passed.

Static checks cannot prove provider credentials, images, Docker/KVM availability, daemon connectivity, or experimental SDK compatibility. Report each unavailable condition separately.

