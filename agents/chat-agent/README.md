# Chat Agent

[English](README.en.md)

这是最小对话助手示例，展示同一份 agent-compose 配置既可以由 daemon CLI 调用，也可以由 daemon 的 Connect RPC HTTP API 调用。

## 工作原理

`agent-compose.yml` 声明一个名为 `chat` 的 Agent。daemon 为每次请求创建 Docker sandbox，在其中启动 `agent-compose-guest`，并将用户提示交给已配置的 `codex` provider。模型由 daemon 的 provider 配置决定，示例不绑定具体模型。

```text
CLI / Connect API → agent-compose daemon → chat Agent → model provider
```

## 启动

```bash
agent-compose config --quiet
agent-compose up
```

通过 CLI 对话：

```bash
agent-compose run chat --prompt "请用三句话解释 agent-compose 的用途"
```

也可以启动交互式会话：

```bash
agent-compose run -it chat --prompt "你好，请先介绍自己"
```

## 通过 daemon API 调用

daemon 暴露 Connect RPC API。先从 `agent-compose up --json` 或 `agent-compose inspect project chat-agent --json` 的输出取得实际 `projectId`，然后调用 unary `RunAgent`：

```bash
export AGENT_COMPOSE_HOST=http://127.0.0.1:7410
export PROJECT_ID='<project-id>'

curl -sS "$AGENT_COMPOSE_HOST/agentcompose.v2.RunService/RunAgent" \
  -H 'Content-Type: application/json' \
  -d "{\"projectId\":\"$PROJECT_ID\",\"agentName\":\"chat\",\"prompt\":\"请介绍一下你能做什么\"}"
```

如果 daemon 开启了认证，再按部署配置添加 `Authorization` 请求头。该接口等待运行结束后返回结果；异步客户端可使用同一服务的 `StartAgentRun`。

## 预期效果与清理

回答应遵循用户语言、简洁且不编造信息。查看运行和日志后清理项目：

```bash
agent-compose logs chat
agent-compose down
```

