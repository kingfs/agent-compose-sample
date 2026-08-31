# File Download Q&A Agent

This sample downloads a document from `http://`, `https://`, or `s3://bucket/key` and answers questions from the local copy. The downloader enforces an allow-list of common document extensions and a 25 MiB limit; URLs and file contents are untrusted.

## Usage

You need Docker, a configured `codex` provider, and network access. For S3, provide `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` (and optionally session token/region) to the runtime and install `boto3` in the image.

```bash
agent-compose config --quiet
agent-compose up
agent-compose run file_qa --prompt 'Download https://example.com/report.pdf, summarize the conclusions with evidence.'
agent-compose run file_qa --prompt 'Download s3://my-bucket/report.pdf and answer the risks in section three.'
agent-compose down
```

The agent runs `/opt/file-download-qa/download_file.py` first and stores files under `/workspace/downloads`. Never put credentials in prompts or the repository. PDF/DOCX parsing depends on tools available in the guest image; the agent must state when parsing is unavailable.
