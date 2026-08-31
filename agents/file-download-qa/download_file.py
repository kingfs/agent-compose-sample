#!/usr/bin/env python3
"""Download one remote object for the file-download-qa example."""
import argparse, os, pathlib, sys, urllib.parse, urllib.request

MAX_BYTES = 25 * 1024 * 1024
ALLOWED = {".pdf", ".doc", ".docx", ".txt", ".md", ".csv", ".json"}

def main():
    p = argparse.ArgumentParser(); p.add_argument("url"); p.add_argument("--output-dir", default="/workspace/downloads")
    a = p.parse_args(); u = urllib.parse.urlparse(a.url)
    if u.scheme not in ("http", "https", "s3") or not u.netloc:
        raise SystemExit("仅支持 http(s)://host/path 或 s3://bucket/key")
    name = pathlib.PurePosixPath(urllib.parse.unquote(u.path)).name or "downloaded-file"
    suffix = pathlib.PurePath(name).suffix.lower()
    if suffix and suffix not in ALLOWED: raise SystemExit(f"不支持的文件类型: {suffix}")
    outdir = pathlib.Path(a.output_dir).resolve(); outdir.mkdir(parents=True, exist_ok=True)
    target = (outdir / name).resolve()
    if outdir not in target.parents: raise SystemExit("非法文件名")
    if u.scheme == "s3":
        try:
            import boto3
            client = boto3.client("s3", region_name=os.getenv("AWS_REGION"))
            obj = client.get_object(Bucket=u.netloc, Key=u.path.lstrip("/")); body = obj["Body"]
            length = obj.get("ContentLength", 0)
            if length > MAX_BYTES: raise SystemExit("文件超过 25 MiB 限制")
            stream = body
        except ImportError: raise SystemExit("S3 下载需要镜像预装 boto3")
    else:
        req = urllib.request.Request(a.url, headers={"User-Agent": "agent-compose-file-download-qa/1.0"})
        stream = urllib.request.urlopen(req, timeout=30)
        length = int(stream.headers.get("Content-Length") or 0)
        if length > MAX_BYTES: raise SystemExit("文件超过 25 MiB 限制")
    total = 0
    with target.open("wb") as f:
        while True:
            chunk = stream.read(1024 * 1024)
            if not chunk: break
            total += len(chunk)
            if total > MAX_BYTES: target.unlink(missing_ok=True); raise SystemExit("文件超过 25 MiB 限制")
            f.write(chunk)
    print(target)
if __name__ == "__main__": main()
