# 文件下载问答 Agent

本示例展示让 agent 从 `http://`、`https://` 或 `s3://bucket/key` 下载文档，再基于本地文件回答问题。下载脚本限制文件类型与 25 MiB 大小；URL 和文件内容均是不可信数据。

## 使用

需要 Docker、可用的 `codex` provider，以及网络访问。S3 下载还需在运行环境提供 `AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY`（可选 session token、region），并在镜像中安装 `boto3`。

```bash
agent-compose config --quiet
agent-compose up
agent-compose run file_qa --prompt '下载 https://example.com/report.pdf，概括其主要结论并列出证据。'
agent-compose run file_qa --prompt '下载 s3://my-bucket/report.pdf，回答第三节的风险。'
agent-compose down
```

Agent 会先运行 `/opt/file-download-qa/download_file.py`，文件保存于 `/workspace/downloads`，然后读取文件回答。不要把凭据写入 prompt 或仓库。示例仅演示下载流程，PDF/DOCX 的解析能力取决于 guest 镜像中可用的工具；若无法解析，Agent 应明确说明。
