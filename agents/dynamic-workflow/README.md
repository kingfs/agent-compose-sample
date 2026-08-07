# Dynamic Workflow（实验性）

[English](README.en.md)

> 此示例依赖 agent-compose 上游尚未合并的 dynamic workflow PR，作为该 PR 的参考项目发布。稳定版 CLI 即使能通过静态配置校验，也可能因 guest SDK 不含 `workflowFile()` 等 API 而无法运行。

这个示例处理一种部署时无法确定执行图大小的事故调查：规划者根据事故实际涉及的故障域生成 1–4 个假设，运行时为每个假设创建调查 Agent；证据评审者再决定是否动态增加 0–3 个验证 Agent。

```text
事故描述
  → 规划者
  → N 个假设调查 Agent
  → 证据评审者
  → 0..M 个补充验证 Agent
  → 事故指挥报告
```

一次执行的 Agent 数量是 `3 + N + M`，其中 N、M 都来自前序 Agent 的结构化输出。

## 它解决什么问题

传统 scheduler event 链要求部署时预先注册角色和拓扑。面对数量未知的调查分支，通常需要预留固定槽位、手工传递 correlation ID、跳过空槽位、聚合结果、限制并发，并自己处理失败与恢复。

dynamic workflow 允许普通 JavaScript 根据运行时数组构造实际执行图，并统一提供：

- `pipeline()` 和 `parallel()` 动态展开；
- `phase()` 阶段进度；
- JSON Schema 结构化边界；
- 稳定 invocation key；
- resume cache，恢复时复用已经完成的调用。

这里的事故场景只是教学载体，同一模式也适合动态代码审查、按数据集分片处理或按规划结果选择专家。

## 文件结构

- `agent-compose.yml`：scheduler 入口和 sticky sandbox 配置。
- `workflows/incident-investigation.js`：可审阅的动态工作流定义，prompt 默认使用中文。
- `run-workflow.mjs`：调用实验性 runtime SDK。
- `Dockerfile`：把工作流源文件加入 guest 镜像。

## 构建与运行

先确保 daemon、CLI、`chaitin/agent-compose-guest:latest` 和 runtime SDK 都来自包含 dynamic workflow PR 的同一版本。

```bash
docker build -t agent-compose-sample/dynamic-workflow:latest .
agent-compose config --quiet
agent-compose up
agent-compose scheduler invoke incident_workflow --payload '{
  "incident": "订单服务发布后延迟升高，数据库锁等待与下游超时同时增加",
  "secondWave": "auto"
}'
```

`secondWave` 可设为 `auto`、`force` 或 `skip`。输出中的 `runId` 可用于演示恢复：

```bash
agent-compose scheduler invoke incident_workflow --payload '{
  "incident": "订单服务发布后延迟升高，数据库锁等待与下游超时同时增加",
  "secondWave": "auto",
  "resumeRunId": "<workflow-run-id>"
}'
```

## 预期效果与清理

输出包含实际 Agent 数、假设数、补充验证数、每个 invocation 的状态及最终中文报告。工作流只提出证据收集和安全操作建议，不会访问生产环境。

```bash
agent-compose scheduler logs --scheduler incident_workflow
agent-compose down
```
