# Agent 输入输出 Schema

[English](README.en.md)

> 此示例依赖尚未进入稳定版本的 `agents.<name>.input_schema` 和
> `agents.<name>.output_schema` 字段。请使用包含该功能的 agent-compose
> 构建版本。

## 场景与目的

这个示例展示如何为 Agent 声明机器可读的输入输出契约，方便外部平台生成表单、展示参数说明或规划集成。`input_schema` 直接内联在 Compose 文件中，`output_schema` 从项目内的 JSON Schema 文件加载。

这些字段当前是接口元数据：daemon 会在 `up` 时解析、规范化和保存 Schema 快照，但不会自动用它们拒绝某次调用的输入，也不会自动校验 Agent 的实际输出。需要强制校验时，调用方仍应自行校验；运行接口单次提供的 output schema 继续遵循其自身语义。

## 工作原理

```text
agent-compose.yml ── input_schema（内联）
        │
        └────────── output_schema（文件引用）
                         │
                         ▼
              config/up 解析并保存快照
                         │
                         ▼
              外部平台读取 Agent 契约
```

项目只有一个无工作区、无外部工具的 `researcher` Agent。部署环境负责配置 `codex` provider 和具体模型。

## 前置条件

- 包含 Agent input/output schema 功能的 agent-compose CLI 和 daemon；
- 已配置可用的 `codex` provider；
- Docker 能拉取 `chaitin/agent-compose-guest:latest`。

## 验证与运行

```bash
agent-compose config --quiet
agent-compose config --json
agent-compose up
agent-compose run researcher --prompt "总结 JSON Schema 的三个主要用途"
```

`config --json` 应显示规范化后的 `input_schema` 和完整的 `output_schema` 内容，而不是文件引用 descriptor。Agent 的回答内容取决于 provider；Schema 声明本身不会强制回答采用 JSON 格式。

## 清理

```bash
agent-compose down
```

