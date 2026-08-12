# At 2 a.m., the Incident Room Has Plenty of Opinions

> Column: 02 · Dynamic workflow

When orders slow down at 2:17 a.m., one engineer blames the database, another blames the latest release, and a third asks about the dependency. The awkward part is that nobody knows how many specialists the incident will actually need.

![A temporary incident investigation team](../assets/dynamic-workflow-flow.svg)

`dynamic-workflow` waits for the scene before forming the team. A planner creates one to four hypotheses. Investigation Agents are created for those hypotheses. An evidence judge then decides whether zero to three follow-up investigators are needed.

The capability is now part of newer agent-compose releases. Use compatible daemon, CLI, guest image, and runtime SDK versions.

The model handles interpretation; JavaScript handles the queue, concurrency, limits, schemas, phases, and resume keys. Experts can argue about the incident, but they cannot quietly invite forty more experts.

```bash
cd agents/dynamic-workflow
agent-compose config --quiet
agent-compose up
agent-compose scheduler invoke incident_workflow --payload '{
  "incident": "Latency rose after a release; lock waits and downstream timeouts also increased",
  "secondWave": "auto"
}'
```

If the run stops halfway, resume it with its `runId`; completed invocations can be reused. The pattern also fits code review, data sharding, and any job whose size is unknown until the input arrives.

For schemas, limits, and recovery details, see the [dynamic-workflow README](../../agents/dynamic-workflow/README.en.md).
