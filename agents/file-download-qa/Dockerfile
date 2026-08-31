FROM chaitin/agent-compose-guest:latest
COPY download_file.py /opt/file-download-qa/download_file.py
RUN python3 -m pip install --no-cache-dir boto3 && chmod 0755 /opt/file-download-qa/download_file.py
