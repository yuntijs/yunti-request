import createTestServer from 'create-test-server';
import request from '../src/index';

const writeData = (data, res) => {
  res.setHeader('access-control-allow-origin', '*');
  res.setHeader('access-control-allow-credentials', 'true');
  res.setHeader('access-control-allow-headers', 'Content-Type,X-Requested-With,from');
  res.send(data);
};

describe('upload by xhr', () => {
  let server;
  beforeAll(async () => {
    server = await createTestServer();
  });
  afterAll(() => {
    server.close();
  });

  const prefix = api => `${server.url}${api}`;

  describe('test file upload by xhr', () => {
    it('should upload a file', async done => {
      const multer = require('multer');
      const upload = multer({ dest: 'test/uploads-files/' });
      const route = '/test/upload/file';
      server.options(route, (req, res) => {
        writeData('ok', res);
      });
      server.post(route, upload.single('file'), (req, res) => {
        expect(req.headers['x-requested-with']).toBe('XMLHttpRequest');
        expect(req.file?.originalname).toBe('bar.txt');
        expect(req.file?.mimetype).toBe('text/plain');
        writeData(req.body, res);
      });

      const url = prefix(route);
      const fileBits = [];
      for (let i = 0; i < 1024; i++) {
        fileBits.push('bar\n');
      }
      const file = new File(fileBits, 'bar.txt', {
        type: 'text/plain',
      });
      request.upload(url, {
        file,
        filename: 'file',
        data: { a: 1, b: 2, c: [3, 4] },
        withCredentials: true,
        onSuccess(res, xhr) {
          expect(res.a).toBe('1');
          expect(res.b).toBe('2');
          expect(res.c).toEqual(['3', '4']);
          done();
        },
        onError(e) {
          console.warn('upload error', e);
          done();
        },
      });
    });

    it('should upload a file with formdata', async done => {
      const multer = require('multer');
      const upload = multer({ dest: 'test/uploads-files/' });
      const route = '/test/upload/formdata';
      server.options(route, (req, res) => {
        writeData('ok', res);
      });
      server.post(route, upload.single('file'), (req, res) => {
        expect(req.headers.from).toBe('hello');
        expect(req.headers['x-requested-with']).toBe(undefined);
        expect(req.file?.originalname).toBe('foo.txt');
        expect(req.file?.mimetype).toBe('text/plain');
        writeData(req.body, res);
      });

      const url = prefix(route);
      const formData = new FormData();
      formData.append('key1', 'test1');
      formData.append('key2', 'test2');
      const fileBits = [];
      for (let i = 0; i < 1024; i++) {
        fileBits.push('foo\n');
      }
      const file = new File(fileBits, 'foo.txt', {
        type: 'text/plain',
      });
      formData.append('file', file);
      request.upload(url, {
        formData,
        headers: {
          from: 'hello',
          'X-Requested-With': null,
        },
        onSuccess(res, xhr) {
          expect(res.key1).toBe('test1');
          expect(res.key2).toBe('test2');
          done();
        },
        onError(e) {
          console.warn('upload error', e);
        },
        onProgress(e) {
          // @Todo: jsdom 环境无法触发 onprogress 事件
          // console.log('percent', e.percent)
          // expect(typeof e.percent).toBe('number')
        },
      });
    });

    it('should abort a file upload', async done => {
      const multer = require('multer');
      const upload = multer({ dest: 'test/uploads-files/' });
      const route = '/test/upload/abort';
      server.options(route, (req, res) => {
        writeData('ok', res);
      });
      server.post(route, upload.single('file'), (req, res) => {
        writeData(req.body, res);
      });

      const url = prefix(route);
      const file = new File(['bar'], 'bar.txt', {
        type: 'text/plain',
      });
      const up = request.upload(url, {
        file,
        filename: 'file',
        onAbort(e) {
          expect(e.type).toBe('abort');
          done();
        },
      });
      up.abort();
    });

    it('should get a file upload error', async done => {
      const multer = require('multer');
      const upload = multer({ dest: 'test/uploads-files/' });
      const route = '/test/upload/error';
      server.options(route, (req, res) => {
        writeData('ok', res);
      });
      server.post(route, upload.single('file'), (req, res) => {
        res.status(400);
        writeData({ message: '400 error' }, res);
      });

      const url = prefix(route);
      const file = new File(['bar'], 'bar.txt', {
        type: 'text/plain',
      });
      request.upload(url, {
        file,
        filename: 'file',
        onError(e, body) {
          expect(e.status).toBe(400);
          expect(body.message).toBe('400 error');
          done();
        },
      });
    });

    it('should trigger onerror of xhr', async done => {
      const route = '/test/upload/error';
      const file = new File(['bar'], 'bar.txt', {
        type: 'text/plain',
      });
      request.upload(route, {
        file,
        filename: 'file',
        onError(e, body) {
          expect(e.total).toBe(0);
          done();
        },
      });
    });
  });
});
