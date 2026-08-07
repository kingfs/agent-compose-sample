# Event-driven Workflow

[English](README.en.md)

这个示例展示三个独立 Agent 如何通过持久化事件串联完成“分析 → 实现建议 → 测试建议”。它不绑定 GitLab 或 GitHub，也不要求三个角色共享 sandbox。

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
