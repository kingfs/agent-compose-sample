# Runtime JavaScript

Use runtime JavaScript only for deterministic orchestration beyond a direct prompt.

The guest runtime SDK may expose `agent`, `llm`, `exec`, `shell`, environment/path helpers, logging, reporting, and workflow APIs depending on the installed version. Verify APIs against that version. Prefer argument-based execution over shell strings; propagate failures and set timeouts.

Scheduler scripts use the injected `scheduler` API. They may register cron/interval/timeout/event handlers, call `scheduler.agent`, publish events, validate structured data, log, and maintain bounded state. Scheduler APIs and guest runtime SDK APIs are not interchangeable.

Keep short scheduler programs inline for portable projects. Use an external script only when the daemon can access its source. Treat event bodies as untrusted and pass only the context each stage needs.

When another program consumes model output, validate it with `scheduler.z`, JSON Schema, or equivalent before publishing it downstream.

