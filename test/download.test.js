import createTestServer from 'create-test-server';
import request from '../src/index';
import fs from 'fs';

const writeData = (data, res) => {
  res.setHeader('access-control-allow-origin', '*');
  res.setHeader(
    'access-control-allow-headers',
    'Content-Type,username,authorization,teamspace,project,onbehalfuser,tenant'
  );
  res.send(data);
};

describe('download by fetch', () => {
  let server;
  beforeAll(async () => {
    global.URL.createObjectURL = jest.fn(() => 'details');
    server = await createTestServer();
  });
  afterAll(() => {
    server.close();
  });

  const prefix = api => `${server.url}${api}`;

  // 测试请求
  describe('test file download by fetch', () => {
    it('should download a file with specify name and type', async done => {
      const route = '/test/download1';
      server.post(route, (req, res) => {
        expect(req.query.action).toBe('export');
        const file = fs.readFileSync('./README.md');
        writeData(file, res);
      });

      const url = prefix(route);
      await request.download(url, {
        method: 'post',
        params: {
          action: 'export',
        },
        download: {
          fileName: 'README',
          fileMimeType: 'text/markdown',
        },
      });
      expect(global.URL.createObjectURL).toHaveBeenCalledTimes(1);
      done();
    });

    it('should download a file with Authorization headers', async done => {
      const route = '/test/download2';
      const AuthorizationHeader = 'Bearer 9981';
      server.options(route, (req, res) => writeData('ok', res));
      server.post(route, (req, res) => {
        expect(req.headers.authorization).toBe(AuthorizationHeader);
        const file = fs.readFileSync('./README.md');
        res.setHeader('Content-Disposition', 'attachment;fileName=README.md');
        writeData(file, res);
      });

      const url = prefix(route);
      await request.download(url, {
        method: 'post',
        headers: {
          Authorization: AuthorizationHeader,
        },
        download: {},
      });
      expect(global.URL.createObjectURL).toHaveBeenCalledTimes(2);
      done();
    });

    it('should download a file with getFileNameFromHeaders', async done => {
      const route = '/test/download3';
      server.post(route, (req, res) => {
        const file = fs.readFileSync('./README.md');
        res.setHeader('Content-Disposition', 'attachment;fileName=README.md');
        writeData(file, res);
      });

      const url = prefix(route);
      await request.download(url, {
        method: 'post',
        download: {
          getFileNameFromHeaders: headers => {
            const contenType = headers.get('content-type');
            expect(contenType).toBe('application/octet-stream');
          },
        },
      });
      expect(global.URL.createObjectURL).toHaveBeenCalledTimes(3);
      done();
    });
  });
});
