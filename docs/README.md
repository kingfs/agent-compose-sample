# 仓库文档与 GitHub Pages

[English](README.en.md)

这里记录仓库本身的开发和文档发布约定；各个示例的运行说明仍放在 `agents/*/README.md`，面向场景的故事文章放在 `docs/*/index.md`。

## GitHub Pages 内容

推送任意 tag，或在 GitHub Actions 手动运行 `Publish agent documentation`，都会构建并部署 Pages。

- `/`：中文 Agent 示例索引。
- `/en/`：英文 Agent 示例索引。
- `/agents/{name}/`：中文技术 README。
- `/en/agents/{name}/`：英文技术 README。
- `/stories/`：中文“Agent 上班实录”故事入口。
- `/stories/{name}/`：单篇故事化软文。

故事文章使用 `docs/assets/*.svg` 中的本地插画，构建脚本会把它们复制到站点的 `/stories/assets/`，不依赖外部图床或 CDN。

## 本地构建

```bash
node scripts/build-pages.mjs --output .pages-src
```

生成目录仅用于预览和 Jekyll 输入，不应提交。Pages 工作流随后使用 `actions/jekyll-build-pages` 完成构建。

## 修改与校验

修改示例时，保持每个目录同时拥有中英文 README，并运行：

```bash
node .agents/skills/create-agent-compose-agents/scripts/validate-project.mjs agents/<name>
(cd agents/<name> && agent-compose config --quiet)
```

修改文档构建器或故事文章后，再运行本地 Pages 构建和 `git diff --check`。
