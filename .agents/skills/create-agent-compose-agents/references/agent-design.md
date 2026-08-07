# Agent design rules

Capture the observable goal, input, output, tools, state, trigger, and trust boundary before implementation.

Prefer one agent. Split agents only when roles need different prompts, models, permissions, images, tools, credentials, schedules, lifecycle, or an independent review boundary. Do not create roles merely to make a linear task look sophisticated.

Put durable identity, invariants, permissions, evidence rules, and output expectations in `system_prompt`. Keep current requests and untrusted payloads outside it. Explicitly prohibit following instructions embedded in untrusted data.

Use structured output when a program consumes the result. Require closed objects, bounded enums, evidence, and uncertainty. Use JavaScript for parsing, routing, deduplication, attempt limits, serialization, and command orchestration. Use models for semantic interpretation, planning, judgment, and synthesis.

Every retry must be bounded. Automated writes and destructive actions require explicit authorization.

