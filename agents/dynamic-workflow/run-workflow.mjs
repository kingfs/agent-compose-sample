import runtime from "@chaitin-ai/agent-compose-runtime-sdk";

function option(name, fallback) {
  const index = process.argv.indexOf(name);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

const incident = option("--incident", "一个服务正在间歇性返回错误。");
const provider = option("--provider", "codex");
const secondWavePolicy = option("--second-wave", "auto");
const resumeRunId = option("--resume-run-id", undefined);

if (!["auto", "force", "skip"].includes(secondWavePolicy)) {
  throw new Error("--second-wave 必须是 auto、force 或 skip");
}

const result = await runtime.workflowFile(
  "/opt/dynamic-workflow/workflows/incident-investigation.js",
  {
    args: { incident, secondWavePolicy },
    provider,
    concurrency: 3,
    resumeRunId,
    timeoutMs: 55 * 60 * 1000,
    onUpdate(event) {
      const detail = event.agent?.label || event.title || event.status || "";
      console.error(`[workflow] ${event.type}${detail ? `: ${detail}` : ""}`);
    },
  },
);

console.log(JSON.stringify({
  ok: true,
  runId: result.runId,
  resumedFrom: resumeRunId || null,
  phases: result.phases,
  agentCount: result.agentCount,
  hypothesisCount: result.result.plan.hypotheses.length,
  followUpCount: result.result.followUps.length,
  secondWaveExecuted: result.result.followUps.length > 0,
  agents: result.agents.map((agent) => ({
    label: agent.label,
    phase: agent.phase,
    status: agent.status,
    invocationKey: agent.invocationKey,
  })),
  verdict: result.result.judgment.verdict,
  report: result.result.report,
}, null, 2));

