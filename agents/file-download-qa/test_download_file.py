import tempfile, unittest
from pathlib import Path
from unittest.mock import patch
import download_file

class Body:
    def __init__(self, data): self.data = data; self.closed = False
    def read(self, n): out, self.data = self.data[:n], self.data[n:]; return out
    def close(self): self.closed = True
class TestDownload(unittest.TestCase):
    def test_scheme_and_size(self):
        with tempfile.TemporaryDirectory() as d:
            with self.assertRaises(ValueError): download_file.download('ftp://x/a.txt', d)
            fake = type('R', (), {'status': 200, 'headers': {}, 'read': lambda s,n: b'x', 'close': lambda s: None})()
            with patch.object(download_file.urllib.request, 'build_opener', return_value=type('O', (), {'open': lambda *a, **k: fake})()), patch.object(download_file, '_copy', side_effect=ValueError('too big')):
                with self.assertRaises(ValueError): download_file.download('https://x/a.txt', d)
            self.assertFalse(list(Path(d).glob('*')))
    def test_s3_mock(self):
        body = Body(b'hello')
        class Client:
            def get_object(self, **kwargs): return {'Body': body, 'ContentLength': 5}
        with tempfile.TemporaryDirectory() as d, patch.dict('sys.modules', {'boto3': type('B', (), {'client': lambda *a, **k: Client()})()}):
            result = download_file.download('s3://bucket/a.txt', d)
            self.assertEqual(Path(result).read_bytes(), b'hello'); self.assertTrue(body.closed)
if __name__ == '__main__': unittest.main()
