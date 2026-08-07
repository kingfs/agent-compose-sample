# agent-compose 示例

[English](README.en.md)

本仓库提供一组可运行、可阅读的 [agent-compose](https://github.com/chaitin/agent-compose) 示例。它们既是入门教程，也是展示对话、调度、事件协作和动态工作流能力的参考项目。

## GitHub Pages 文档

每次推送 tag 时，[Pages 工作流](.github/workflows/pages.yml) 会自动提取所有 `agents/*/README.md` 和 `README.en.md`，生成默认中文、可切换英文的静态文档站点并部署到 GitHub Pages。也可以从 GitHub Actions 手动触发该工作流。

首次使用前，请在仓库 **Settings → Pages → Build and deployment** 中将 Source 设为 **GitHub Actions**。之后发布任意 tag 即会自动更新站点。

本地检查生成结果：

```bash
node scripts/build-pages.mjs --output .pages-src
```

## 示例

| 示例 | 难度 | 展示能力 |
| --- | --- | --- |
| [chat-agent](agents/chat-agent/README.md) | 入门 | 通过 daemon CLI 或 Connect API 启动对话助手 |
| [scheduled-agent](agents/scheduled-agent/README.md) | 入门 | 同一个 Agent 响应 cron、interval、timeout 和 event |
| [event-driven-workflow](agents/event-driven-workflow/README.md) | 进阶 | 三个 Agent 通过事件完成分析、实现建议和测试建议 |
| [dynamic-workflow](agents/dynamic-workflow/README.md) | 实验性 | 根据运行时结果动态展开并行 Agent 执行图 |
| [agent-creator](agents/agent-creator/README.md) | 进阶 | 根据自然语言需求创建、校验并导入新项目 |

## 准备 agent-compose

开始前，请按照 [agent-compose 官方文档](https://github.com/chaitin/agent-compose) 部署 daemon、安装 `agent-compose` CLI，并配置至少一个可用的模型提供方。Docker 示例还要求 daemon 能访问 Docker。

确认 CLI 可以连接 daemon：

```bash
agent-compose version
agent-compose --host http://127.0.0.1:7410 version
```

端口或认证方式不同时，请按你的部署调整 `--host` 和相关环境变量。本文档中的命令默认在具体示例目录执行。

## 运行示例

除文档明确说明的构建步骤外，各示例使用同一套基本流程：

```bash
cd agents/chat-agent
agent-compose config --quiet
agent-compose up
agent-compose run chat --prompt "请介绍一下你自己"
agent-compose logs chat
agent-compose down
```

每个目录的 README 会说明该示例的触发方式、工作原理、预期效果和清理步骤。

> `dynamic-workflow` 依赖尚未合并的上游 dynamic workflow PR。它作为该设计的参考项目发布，不能保证在稳定版 agent-compose 上运行。

## 使用仓库 Skill

仓库级 Skill 位于 [`.agents/skills/create-agent-compose-agents`](.agents/skills/create-agent-compose-agents/SKILL.md)。支持 Skills 的 AI 编程 Agent 可以读取它，按 agent-compose 的配置约束设计、生成和校验新示例。仓库协作规则见 [AGENTS.md](AGENTS.md)。

## 贡献原则

- 一个示例只讲清一个主要概念，优先使用最小可运行配置。
- 每个示例必须包含 `README.md` 和 `README.en.md`。
- 不提交凭据、公司内部地址、本机绝对路径、固定运行 ID 或实验模型名称。
- 使用环境变量表示敏感配置，并仅提交空值或安全占位符的 `.env.example`。
- 提交前至少运行 `agent-compose config --quiet`；实验特性需明确标记版本或 PR 依赖。

## License

[Apache License 2.0](LICENSE)
