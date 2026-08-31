#!/usr/bin/env python3
import argparse, os, pathlib, tempfile, urllib.parse, urllib.request
MAX_BYTES = 25 * 1024 * 1024
ALLOWED = {'.pdf','.doc','.docx','.txt','.md','.csv','.json'}
class SafeRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        old, new = urllib.parse.urlparse(req.full_url), urllib.parse.urlparse(newurl)
        if new.scheme not in ('http','https') or new.netloc != old.netloc:
            raise OSError('redirect must stay on the same HTTP(S) host')
        return super().redirect_request(req, fp, code, msg, headers, newurl)
def _copy(stream, target):
    total = 0
    with open(target, 'wb') as output:
        while True:
            chunk = stream.read(1024 * 1024)
            if not chunk: break
            total += len(chunk)
            if total > MAX_BYTES: raise ValueError('file exceeds 25 MiB limit')
            output.write(chunk)
def download(url, output_dir='/workspace/downloads'):
    parsed = urllib.parse.urlparse(url)
    if parsed.scheme not in ('http','https','s3') or not parsed.netloc: raise ValueError('only http(s)://host/path or s3://bucket/key is supported')
    name = pathlib.PurePosixPath(urllib.parse.unquote(parsed.path)).name or 'downloaded-file'
    suffix = pathlib.PurePath(name).suffix.lower()
    if suffix and suffix not in ALLOWED: raise ValueError(f'unsupported file type: {suffix}')
    outdir = pathlib.Path(output_dir).resolve(); outdir.mkdir(parents=True, exist_ok=True)
    target = (outdir / name).resolve()
    if outdir not in target.parents: raise ValueError('invalid filename')
    fd, temp_name = tempfile.mkstemp(dir=outdir, prefix='.download-'); os.close(fd)
    try:
        if parsed.scheme == 's3':
            import boto3
            response = boto3.client('s3', region_name=os.getenv('AWS_REGION')).get_object(Bucket=parsed.netloc, Key=parsed.path.lstrip('/'))
            stream = response['Body']
            try:
                if response.get('ContentLength', 0) > MAX_BYTES: raise ValueError('file exceeds 25 MiB limit')
                _copy(stream, temp_name)
            finally: stream.close()
        else:
            response = urllib.request.build_opener(SafeRedirect()).open(urllib.request.Request(url), timeout=30)
            try:
                if response.status < 200 or response.status >= 300: raise OSError(f'HTTP status {response.status}')
                length = response.headers.get('Content-Length')
                if length and int(length) > MAX_BYTES: raise ValueError('file exceeds 25 MiB limit')
                _copy(response, temp_name)
            finally: response.close()
        os.replace(temp_name, target)
    except Exception:
        pathlib.Path(temp_name).unlink(missing_ok=True); raise
    return target
def main():
    parser = argparse.ArgumentParser(); parser.add_argument('url'); parser.add_argument('--output-dir', default='/workspace/downloads')
    args = parser.parse_args()
    try: print(download(args.url, args.output_dir))
    except Exception as exc: raise SystemExit(str(exc))
if __name__ == '__main__': main()
