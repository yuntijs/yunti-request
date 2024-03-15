import createTestServer from 'create-test-server';
import request from '../src/index';

const writeData = (data, res) => {
  res.setHeader('access-control-allow-origin', '*');
  res.send(data);
};

describe('timeout', () => {
  let server;
  beforeAll(async () => {
    server = await createTestServer();
  });
  afterAll(() => {
    server.close();
  });

  const prefix = api => `${server.url}${api}`;

  it('should be ok when response in time ', async done => {
    expect.assertions(1);
    server.get('/test/timeout', (req, res) => {
      setTimeout(() => {
        writeData('ok', res);
      }, 1000);
    });

    // receive response before timeout
    const response = await request(prefix('/test/timeout'), {
      timeout: 1200,
      getResponse: true,
    });
    expect(response.response.ok).toBe(true);
    done();
  });

  it('should throw Request Error when timeout', async done => {
    expect.assertions(3);
    server.get('/test/timeout', (req, res) => {
      setTimeout(() => {
        writeData('ok', res);
      }, 1000);
    });

    // receive after timeout
    try {
      await request(prefix('/test/timeout'), { timeout: 800 });
    } catch (error) {
      expect(error.name).toBe('RequestError');
      expect(error.message).toBe('timeout of 800ms exceeded');
      expect(error.request.options.timeout).toBe(800);
      done();
    }
  });
});
