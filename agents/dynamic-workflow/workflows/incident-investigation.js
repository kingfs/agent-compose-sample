export const meta = {
  name: "dynamic-incident-investigation",
  description: "根据事故中的故障域动态展开调查，并在证据不足时增加第二轮验证",
  whenToUse: "部署时无法预知假设数量和后续验证数量的复杂事故",
  phases: [
    { title: "规划假设" },
    { title: "第一轮调查" },
    { title: "评估证据" },
    { title: "验证证据缺口" },
    { title: "生成指挥报告" },
  ],
};

const PlanSchema = {
  type: "object",
  additionalProperties: false,
  required: ["incidentId", "hypotheses"],
  properties: {
    incidentId: { type: "string" },
    hypotheses: {
      type: "array",
      minItems: 1,
      maxItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "domain", "evidenceNeeded"],
        properties: {
          title: { type: "string" },
          domain: { type: "string", enum: ["application", "database", "infrastructure", "dependency", "security"] },
          evidenceNeeded: { type: "array", minItems: 1, maxItems: 4, items: { type: "string" } },
        },
      },
    },
  },
};

const InvestigationSchema = {
  type: "object",
  additionalProperties: false,
  required: ["status", "confidence", "evidence", "gaps"],
  properties: {
    status: { type: "string", enum: ["supported", "refuted", "unknown"] },
    confidence: { type: "string", enum: ["low", "medium", "high"] },
    evidence: { type: "array", maxItems: 5, items: { type: "string" } },
    gaps: { type: "array", maxItems: 4, items: { type: "string" } },
  },
};

const JudgmentSchema = {
  type: "object",
  additionalProperties: false,
  required: ["verdict", "needsSecondWave", "followUps"],
  properties: {
    verdict: { type: "string", enum: ["actionable", "inconclusive", "conflicting"] },
    needsSecondWave: { type: "boolean" },
    followUps: {
      type: "array",
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["question", "domain"],
        properties: {
          question: { type: "string" },
          domain: { type: "string", enum: ["application", "database", "infrastructure", "dependency", "security"] },
        },
      },
    },
  },
};

const FollowUpSchema = {
  type: "object",
  additionalProperties: false,
  required: ["answer", "confidence", "evidenceToCollect"],
  properties: {
    answer: { type: "string" },
    confidence: { type: "string", enum: ["low", "medium", "high"] },
    evidenceToCollect: { type: "array", minItems: 1, maxItems: 4, items: { type: "string" } },
  },
};

phase("规划假设");
const plan = await agent([
  "你是事故调查规划者。请将事故描述拆分为最少且相互独立的有效假设。",
  "根据实际涉及的故障域生成一到四个假设。",
  "不得编造已观测到的证据。仅返回符合 Schema 的 JSON。",
  "事故描述：",
  args.incident,
].join("\n"), {
  key: "plan",
  label: "规划调查队列",
  agentType: "incident-planner",
  schema: PlanSchema,
});

log("规划者生成了 " + plan.hypotheses.length + " 个假设");

const investigations = await phase("第一轮调查", async () => await pipeline(
  plan.hypotheses,
  (previous, hypothesis, index) => agent([
    "你是该假设对应领域的调查专家。只能根据给定事故描述评估假设。",
    "区分已报告事实与建议诊断，不得声称已经运行命令。",
    "事故：" + args.incident,
    "假设：" + JSON.stringify(hypothesis),
  ].join("\n"), {
    key: "hypothesis-" + index,
    label: "调查 " + hypothesis.domain + " 假设 " + (index + 1),
    agentType: hypothesis.domain + "-investigator",
    schema: InvestigationSchema,
  }),
));

const policyInstruction = args.secondWavePolicy === "force"
  ? "设置 needsSecondWave=true，并生成一到三个高价值 followUps。"
  : args.secondWavePolicy === "skip"
    ? "设置 needsSecondWave=false，并返回空 followUps 数组。"
    : "仅在证据不足或相互冲突时请求第二轮验证。";

const judgment = await phase("评估证据", async () => await agent([
  "你是证据评审者。比较第一轮调查结果，判断是否值得增加一轮证据收集。",
  policyInstruction,
  "不要重复已经回答的问题。仅返回符合 Schema 的 JSON。",
  "事故：" + args.incident,
  "计划：" + JSON.stringify(plan),
  "调查结果：" + JSON.stringify(investigations),
].join("\n"), {
  key: "judge",
  label: "评估第一轮证据",
  agentType: "evidence-judge",
  schema: JudgmentSchema,
}));

let followUps = [];
if (judgment.needsSecondWave && judgment.followUps.length > 0) {
  followUps = await phase("验证证据缺口", async () => await parallel(
    judgment.followUps.map((followUp, index) => () => agent([
      "你是验证专家。请为未解决的问题设计一个具有判别力的检查。",
      "不得声称检查已经执行；说明可能的解释和需要收集的准确证据。",
      "事故：" + args.incident,
      "问题：" + JSON.stringify(followUp),
    ].join("\n"), {
      key: "follow-up-" + index,
      label: "验证 " + followUp.domain + " 缺口 " + (index + 1),
      agentType: followUp.domain + "-verifier",
      schema: FollowUpSchema,
    })),
  ));
} else {
  log("跳过第二轮证据验证");
}

const report = await phase("生成指挥报告", async () => await agent([
  "你是事故指挥者。生成简明报告，包含：当前判断、假设排序、立即可做的安全操作、证据收集计划、停止或升级条件。",
  "明确声明建议的诊断尚未执行。",
  "事故：" + args.incident,
  "计划：" + JSON.stringify(plan),
  "第一轮：" + JSON.stringify(investigations),
  "评审：" + JSON.stringify(judgment),
  "第二轮：" + JSON.stringify(followUps),
].join("\n"), {
  key: "report",
  label: "撰写事故指挥报告",
  agentType: "incident-commander",
}));

return { plan, investigations, judgment, followUps, report };

