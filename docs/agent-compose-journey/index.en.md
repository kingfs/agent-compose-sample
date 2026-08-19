# After Three Hundred AI Coworkers Arrived, Abu Finally Had Time for Human Work

> Series: 06 · The Agent Compose Enterprise Story

Abu first considered hiring an AI coworker on a Monday morning. By four o'clock, he had answered 38 questions. Twenty-nine were already covered by company policy, six belonged to other departments, and only three required his judgment. Almost all his time had gone to the first two groups.

Product manager Lin suggested a chatbot. Operator Zhou asked three less romantic questions: “What may it read? Who defines how it behaves? And who owns it when it fails at midnight?”

They did not yet know that this unnamed bot would become the company's first AI employee—or that a year later they would operate more than three hundred.

![Abu and the digital front desk](../assets/agent-compose-journey/front-desk.svg)

## The first coworker was deliberately unremarkable

They called it Xiao Da. It answered questions from approved material and admitted when evidence was missing. It could explain expenses but not approve them, and it could recommend a contact without pretending to have called anyone.

Those limits made it trustworthy. Employees first reached it through chat, then through an internal portal and a terminal. The entry points changed; its role and permissions did not have to be copied for every channel.

Agent Compose treated the Agent as a defined, runnable unit: model, environment, material, tools, and role rules belonged to one declaration. The surrounding applications were simply different doors.

Abu did not become unnecessary. He stopped answering where the portal was and started handling cases policy had never anticipated. The machine took over the part of his job that made him behave like a machine.

## A product launch turned one helper into a team

Three months later, the company prepared a product launch. Sales wanted customer-facing Agents by region; support wanted an Agent that organized issues before handing them to people.

The team gave these coworkers a rhythm. One prepared a morning summary, another checked periodically for concentrated complaints, a launch guardian performed a one-time readiness check, and customer submissions woke the appropriate support Agent immediately.

To the business, these were daily reports, recurring checks, a launch reminder, and “call me when something happens.” Agent Compose managed them through one scheduling system. Different wake-up methods did not require duplicated coworkers with duplicated roles.

![One Agent responding to different work rhythms](../assets/agent-compose-journey/triggers.svg)

## The real test arrived seventeen minutes into the launch

Traffic exceeded expectations. Customers reported slow orders and payment failures while database waits and downstream timeouts rose together. The incident channel filled with opinions faster than evidence.

One Agent might miss an avenue; ten permanent investigators would usually waste resources. Before an incident, nobody knows how many useful directions it will contain.

So an analysis Agent first identified the strongest hypotheses. Agent Compose then formed a temporary investigation team from the situation itself. Application, database, and dependency evidence were gathered in parallel. A reviewer identified gaps, and only missing evidence triggered a second round.

Models interpreted the messy scene. Deterministic rules bounded investigation rounds, concurrency, waiting time, and failure behavior. The workflow could exercise judgment without growing into a forty-person meeting at 2 a.m.

The final report separated fact from hypothesis: database pressure was real, but it began with request accumulation after a downstream timeout. The service could be stabilized immediately while release changes were investigated afterward.

![A dynamically formed incident investigation team](../assets/agent-compose-journey/incident-team.svg)

## Recovery finished; the handoff nearly fell back into chat

Service recovery was only half the work. Findings had to reach engineering, and the eventual change needed a test plan. Previously, this knowledge scattered across incident chat, private messages, and temporary documents.

This time, the investigation result became a formal handoff. An implementation Agent received it, prepared file-level guidance within its permissions, and emitted the next handoff for a testing Agent. The three roles did not need to be online together or share an ever-growing conversation.

Each handoff retained its source, content, time, and outcome. A failed stage could be handled without replaying the entire incident. Event-driven work was useful not because it added arrows to a diagram, but because the right coworker received explicit work after something happened—and the transfer remained traceable.

Permissions still mattered. An Agent without repository access could suggest a change, not claim to have made it. A handoff can deliver a message; it cannot invent a key.

![Agents collaborating through handoffs](../assets/agent-compose-journey/handoff.svg)

## Then the company requested two hundred more

After the launch, every department wanted Agents. The request list grew from “two more” to “two hundred this quarter.”

Copying instructions was easy. Operating the coworkers was not.

At one Agent, the question was whether it answered well. At hundreds, the company also needed to know who defined each Agent, which configuration it used, what it could access, whether it was running, what it had done, and who owned failure.

Agent Compose gave different departments one way to describe, validate, deploy, and operate their Agents while preserving distinct roles and permissions. A persistent control service recorded the real state of projects, Agents, runtimes, and work. Teams could apply definitions together, then inspect a single department, coworker, or task when needed.

The real value of “launch three hundred AI coworkers with one action” was not the single action. It was that the fleet was not three hundred mysterious scripts. It had a shared management entry point, individual boundaries, batch operations, targeted diagnosis, and a consistent lifecycle across different models and environments.

Whether three hundred runtimes should start simultaneously remained a capacity, model-quota, and traffic decision. A responsible system does not make servers larger because a headline is large.

![One control plane managing an Agent fleet](../assets/agent-compose-journey/fleet.svg)

## At 3 a.m., seven coworkers stopped answering

Six months later, monitoring reported seven abnormal Agents among more than three hundred.

Zhou began from the unified runtime view, isolated the abnormal objects, and combined task logs with resource state. Two were brief upstream model failures and succeeded on bounded retry. Three runtimes had stopped and were safely resumed after active work was checked. Two failed repeatedly; automation preserved evidence, stopped trying, and paged an operator.

The other 293 continued working. Nobody woke the entire fleet with “restart everything and see.”

That is the less glamorous meaning of self-healing: detect, collect evidence, act by policy, and verify. After a threshold or an unknown condition, stop and ask a human. Agent Compose provides consistent state, logs, and lifecycle operations; each enterprise defines monitoring and recovery policy for its own capacity and risk.

The next morning, Zhou reported: seven anomalies, five recovered, two escalated, everyone else unaffected. It was less exciting than “fully autonomous healing,” but it had objects, evidence, and an outcome.

![Local failure and bounded recovery](../assets/agent-compose-journey/recovery.svg)

## Where did Abu go?

Abu still answers questions, just not the 39th request for the expense portal. He now designs the division of labor between people and AI: what may be handled directly, what requires evidence, what must be escalated, which roles a complex task should recruit, and when automation must wait for approval.

Lin helps the business find appropriate jobs for Agents. Zhou makes sure those ideas remain observable and recoverable at three in the morning.

Together they built more than a larger chatbot. They built an AI work system:

- it converses when someone arrives;
- it starts on a schedule, after a delay, or when the business emits an event;
- one Agent handles simple work;
- a team forms dynamically for complex work;
- events carry results reliably across stages;
- and the fleet remains deployable, observable, and operable as it grows.

These capabilities share one principle: **an Agent should not be merely one clever answer. It should be an enterprise work unit with a role, boundaries, collaboration, and a complete operational lifecycle.**

That is the role of Agent Compose as an enterprise Agent engine. It does not promise ten thousand infallible AI employees. It provides something quieter and harder: as the first coworker becomes a fleet, the organization can still know the rules, inspect the evidence, and decide when machines should continue and when people should take over.

> Capability note: conversational access, scheduled and recurring work, one-time delayed work, external event triggers, dynamic workflow, event-driven collaboration, and unified state, logs, and runtime lifecycle management correspond to Agent Compose capability models. Large-scale definition generation, capacity planning, business monitoring, and recovery policy must be designed for the enterprise's infrastructure. Fleet management does not imply infinite capacity, and recovery does not mean unconditional restart.
