import createTestServer from 'create-test-server';
import { fetch } from '../src/index';

const writeData = (data, res) => {
  res.setHeader('access-control-allow-origin', '*');
  res.send(data);
};

describe('fetch', () => {
  let server;
  beforeAll(async () => {
    server = await createTestServer();
  });
  afterAll(() => {
    server.close();
  });

  const prefix = api => `${server.url}${api}`;

  // 测试请求
  describe('test valid fetch', () => {
    it('response should be true', async done => {
      server.get('/test/fetch', (req, res) => {
        setTimeout(() => {
          writeData('ok', res);
        }, 1000);
      });

      const response = await fetch(prefix('/test/fetch'));
      expect(response.ok).toBe(true);
      done();
    });
  });

  describe('test invalid fetch', () => {
    it('test normal and unnormal fetch', async done => {
      expect.assertions(1);
      server.get('/test/fetch', (req, res) => {
        setTimeout(() => {
          writeData('ok', res);
        }, 1000);
      });
      try {
        await fetch({ hello: 'hello' });
      } catch (error) {
        expect(error.message).toBe('url must be a string.');
        done();
      }
    });
  });
});
