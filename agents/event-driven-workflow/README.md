# Event-driven Workflow

[English](README.en.md)

这个示例展示三个独立 Agent 如何通过持久化事件串联完成“分析 → 实现建议 → 测试建议”。它不绑定 GitLab 或 GitHub，也不要求三个角色共享 sandbox。

## 场景与解决的问题

设想一个研发团队每天从需求平台、工单系统或 webhook 接收代码变更请求。单个 Agent 一次性完成需求分析、实现设计和测试设计时，过程难以观察；中途失败后通常要全部重来，也不容易让不同团队分别消费阶段结果。

本示例把这类工作拆成三个由事件衔接的职责边界：分析师先识别目标、影响面和风险；实现设计者把分析转换为文件级修改建议；测试设计者再根据前两阶段生成有优先级的验证计划。它适合演示异步解耦、阶段审计、失败重试，以及把某一阶段替换成团队自有 Agent。它不是自动改代码的流水线，因为示例没有挂载代码仓库或测试环境。

## 工作原理

```text
sample.code-change.requested
  → analyst
  → sample.code-change.analyzed
  → implementer
  → sample.code-change.implementation-designed
  → tester
```

每个角色拥有独立 system prompt 和 scheduler。事件携带关联 ID、原始请求和前序输出，使阶段可以独立观察和重试。示例没有挂载代码仓库，因此 implementer 和 tester 只生成建议，不声称修改代码或执行测试。

一次请求的流转如下：

1. 外部系统或手动命令发布 `sample.code-change.requested`。
2. `analyst` 消费请求并发布包含分析结果的 `sample.code-change.analyzed`。
3. `implementer` 消费分析事件并发布 `sample.code-change.implementation-designed`。
4. `tester` 消费实现设计事件，输出最终测试建议；`correlationId` 用于关联同一次请求的所有阶段。

## 前置条件

- 已安装并配置可用的 agent-compose daemon 和 CLI；
- daemon 已配置 `codex` provider；
- Docker 能拉取 `chaitin/agent-compose-guest:latest`。

## 启动

```bash
agent-compose config --quiet
agent-compose up
agent-compose scheduler ls
```

手动触发入口处理器：

```bash
agent-compose scheduler trigger analyst analyze-change --payload '{
  "correlationId": "demo-001",
  "title": "为登录接口增加请求限流",
  "description": "要求兼容现有客户端，并为被限流请求返回可识别错误"
}'
```

也可以配置 generic webhook source，将外部系统请求发布到 `sample.code-change.requested`。不要在公开配置中硬编码 webhook token。

## 预期效果

一次入口事件会依次产生架构化分析、文件级实现建议和分层测试建议。可以通过事件和 scheduler 运行记录观察整条链路：

```bash
curl -sS 'http://127.0.0.1:7410/api/events?limit=20'
agent-compose scheduler runs
agent-compose logs
agent-compose down
```
