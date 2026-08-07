# Agent Creator

[English](README.en.md)

Agent Creator 把自然语言需求转换为一个最小、可维护的 agent-compose 项目，并使用真实 CLI 校验配置。用户明确要求导入时，它还可以把生成项目提交给 daemon。

## 工作原理

仓库级 [create-agent-compose-agents Skill](../../.agents/skills/create-agent-compose-agents/SKILL.md) 保存设计原则、Compose 约束、运行时参考和确定性脚本。构建镜像时，该 Skill 与 `agent-compose` CLI 一起复制到 guest：

```text
用户需求
  → creator 读取 Skill 并设计角色
  → scaffold.mjs 生成基础项目
  → validate-project.mjs + agent-compose config 校验
  → 可选：publish-project.mjs 导入 daemon
```

生成文件位于 creator sandbox 的 `/workspace`。默认不引用 creator 内部的本地路径，以免 daemon 无法读取生成项目依赖。

## 构建与启动

需要本地已经存在 `agent-compose:latest` 和 `agent-compose-guest:latest` 镜像。由于构建上下文包含仓库级 Skill，请从本示例目录直接使用 Compose 构建配置：

```bash
agent-compose config --quiet
agent-compose image build
agent-compose up
agent-compose run -it creator --prompt \
  "创建一个每天工作日 9 点生成中文待办摘要的 agent-compose 项目，先校验但不要导入"
```

默认 `AGENT_COMPOSE_HOST=http://agent-compose:7410`，适用于标准 Docker Compose 网络。如果 daemon 使用其他可从 sandbox 访问的地址，请在 `agent-compose.yml` 中调整它。sandbox 中的 `127.0.0.1` 指向 sandbox 自身。

## 预期效果与清理

Creator 应报告生成目录、文件、验证级别、缺失的 provider 或运行条件，以及后续命令；不能把静态校验描述成运行验证。

```bash
agent-compose logs creator
agent-compose down
```

仓库维护者和其他 AI Agent 也可以不运行该示例，直接使用 `.agents/skills/create-agent-compose-agents` 开发新项目。

