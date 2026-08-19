# At 3 A.M., Seven of Three Hundred AI Coworkers Stopped Answering

> Series: 05 · Production Agent Operations

At eleven one evening, the first support Agent went live. The operator asked it three questions, the product manager took a screenshot, and the team chat filled with thumbs-up reactions.

A month later, the company had three hundred AI coworkers across sales, support, and twelve business units. At 3:17 a.m., monitoring reported that seven had stopped responding.

Seven questions followed immediately. Where were they running? Were they still using yesterday's configuration? Was the Agent stuck, had its runtime stopped, or was the model service timing out? Would a restart discard active work? And were the other 293 actually healthy?

With one bot, “restart it” had been a plan. At three hundred, it was a lottery.

## One Agent is a demo; three hundred are a fleet

Scale multiplies configuration drift, runtime state, logs, resource use, and recovery risk—not just instance count.

Agent Compose turns scattered startup folklore into declarations. Provider, image, workspace, tools, Skills, volumes, and scheduling use one Compose model, while the daemon becomes the source of truth for runtime state.

```text
agent-compose.yml
        │  declares what should exist
        ▼
      daemon ───── project / agent / sandbox / run
        │                         │
        ├── state and resources   ├── logs and errors
        └── lifecycle operations  └── schedules and events
```

Deployment becomes one validation and one apply operation:

```bash
agent-compose config --quiet
agent-compose up
```

There is an important detail behind the slogan: `up` applies the project definition; it does not ignore capacity and create ten thousand permanent processes at once. Sandboxes can be created when work arrives. Warm fleets should be started through bounded automation with explicit concurrency limits. A single control point makes outcomes consistent and observable; it does not repeal resource constraints.

## Seven are silent—do not wake all three hundred

The operator starts with fleet state rather than visiting machines one by one:

```bash
agent-compose ps --all --json
agent-compose ps --status stopped,failed --verbose
agent-compose stats
```

Machine-readable output feeds monitoring and inventory. The investigation then narrows to abnormal objects:

```bash
agent-compose logs <agent-or-sandbox-id>
agent-compose inspect sandbox <sandbox-id> --json
```

Logs explain what the Agent last did; inspection shows what the control plane believes its runtime state to be. A failed model request does not necessarily mean a dead sandbox, and a stopped sandbox cannot be declared healthy merely because another prompt was sent.

The seven cases split into three groups: two upstream timeouts were retried under a bounded task policy; three stopped sandboxes were resumed together; two repeatedly failed and were escalated with their evidence preserved.

```bash
agent-compose sandbox resume <sandbox-id-1> <sandbox-id-2> <sandbox-id-3>
```

Recovery touched seven abnormal coworkers, not the 293 healthy ones.

## Self-healing is not an infinite restart loop

The JSON state, logs, lifecycle commands, and control-plane API can be composed into a recovery loop:

> inspect on a schedule or event → identify abnormal state → collect evidence → recover by policy → verify → escalate after a threshold

Agent Compose supplies a stable control plane and composable operations. The team supplies the business policy: what counts as failure, which cases are safe to recover, how many attempts are allowed, and when automation must stop and page a human.

```text
detect abnormal state
  ├─ transient request failure ── retry with bounded backoff
  ├─ sandbox stopped ── resume and verify health
  ├─ sandbox failed ── preserve evidence, then rebuild or rerun by policy
  └─ repeated failure ── stop automation and page an operator
```

Unbounded restarts create failure storms. Retry without backoff overwhelms dependencies. Rebuilding without preserving logs destroys evidence. Automation needs brakes as much as it needs an accelerator.

## What does a fleet of ten thousand really test?

Changing three hundred to ten thousand is not primarily a YAML problem. Definitions can be generated and projects can be divided by team, trust boundary, and failure domain. The hard questions are daemon and runtime capacity, model quotas, image distribution, workspaces and volumes, credential isolation, monitoring cardinality, and recovery concurrency.

Agent Compose does not invent infinite capacity. It gives different providers, triggers, and runtimes a consistent declaration and lifecycle model—something an operations system can validate, query, operate, and audit.

A startup script solves one launch. A control plane manages the whole life of an Agent, from definition and execution to observation, failure, and removal.

## By morning, only three coworkers had been restarted

At eight, the business owner asked whether all three hundred Agents had gone down.

The operator shared the record: seven anomalies, two successful task retries, three resumed sandboxes, and two cases escalated after repeated failure. The other 293 were never restarted or disturbed.

With one AI coworker, we ask whether it can answer. With a fleet, we must also know who defined it, who can invoke it, where it is running, and what happens after failure. The production value of Agent Compose is not putting “ten thousand” in a headline. It is keeping a fleet governable: **deploy in bulk without losing boundaries, contain local failures without disturbing everyone, and automate recovery without discarding evidence.**

> Capability note: declarative apply, state queries, JSON output, logs, resource statistics, and batch sandbox lifecycle operations in this story map to Agent Compose control-plane capabilities. Large-scale definition generation, alert policies, and automated recovery policy must be built for the actual infrastructure. Agent Compose should not currently be presented as a native replica controller or an unconditional auto-restart mechanism.
