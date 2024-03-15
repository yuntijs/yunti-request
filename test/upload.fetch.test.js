import createTestServer from 'create-test-server';
import request from '../src/index';

const writeData = (data, res) => {
  res.setHeader('access-control-allow-origin', '*');
  res.send(data);
};

describe('upload by fetch', () => {
  let server;
  beforeAll(async () => {
    server = await createTestServer();
  });
  afterAll(() => {
    server.close();
  });

  const prefix = api => `${server.url}${api}`;

  // 测试请求
  describe('test file upload by fetch', () => {
    it('should upload a file', async done => {
      const multer = require('multer');
      const upload = multer({ dest: 'test/uploads-files/' });
      server.options('/test/upload', (req, res) => {
        writeData('ok', res);
      });
      server.post('/test/upload', upload.single('file'), (req, res) => {
        expect(req.file?.originalname).toBe('foo.txt');
        expect(req.file?.mimetype).toBe('text/plain');
        writeData(req.body, res);
      });

      const url = prefix('/test/upload');
      const formData = new FormData();
      formData.append('key1', 'test1');
      formData.append('key2', 'test2');
      const file = new File(['foo'], 'foo.txt', {
        type: 'text/plain',
      });
      formData.append('file', file);
      const res = await request.post(url, {
        body: formData,
      });
      expect(res.key1).toBe('test1');
      expect(res.key2).toBe('test2');
      done();
    });
  });
});
