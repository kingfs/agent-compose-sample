# Scheduled Agent

[English](README.en.md)

这个示例展示同一个 Agent 代码如何从四种路径执行：cron 定时、interval 周期、timeout 启动后单次延迟，以及外部 event。

## 场景与解决的问题

它适合日报摘要、周期健康提醒、服务启动后的初始化检查，以及由外部业务事件触发的同类任务。四条路径复用同一个 Agent，解决“处理逻辑相同，但触发时间和来源不同”时重复定义多个 Agent 的问题，同时直观展示该在什么时候使用声明式 trigger。

## 工作原理

四个声明式 trigger 最终都调用 `assistant`，但各自提供不同提示。适合逻辑相同、触发时间或来源不同的任务；需要条件路由、状态或跨 Agent 编排时，应改用 `scheduler.script`。

```text
cron ─────┐
interval ─┤
timeout ──┼→ assistant Agent
event ────┘
```

## 前置条件

需要可用的 agent-compose daemon、CLI、`codex` provider，以及能拉取 `chaitin/agent-compose-guest:latest` 的 Docker 环境。cron 使用 daemon 所在环境的时区，部署前应确认时区设置。

## 启动和观察

```bash
agent-compose config --quiet
agent-compose up
agent-compose scheduler ls assistant
```

`startup-reminder` 会在 scheduler 启动约 30 秒后执行一次。cron 和 interval trigger 随时间自动执行。开发时可以手动触发任意路径：

```bash
agent-compose scheduler trigger assistant hourly-status
agent-compose scheduler trigger assistant recurring-heartbeat
agent-compose scheduler trigger assistant startup-reminder
agent-compose scheduler trigger assistant external-event \
  --payload '{"source":"manual-demo"}'
```

生产集成可以向 topic `sample.scheduled-agent.run` 发布事件，event trigger 会自动启动同一个 Agent。Webhook source 的创建和认证方式取决于 daemon 部署，参见 agent-compose webhook 文档。

## 预期效果与清理

不同路径的回答会标明触发来源，但运行的仍是同一个 `assistant`。查看调度历史并清理：

```bash
agent-compose scheduler runs assistant
agent-compose scheduler logs --scheduler assistant
agent-compose down
```
