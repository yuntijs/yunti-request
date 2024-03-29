import createTestServer from 'create-test-server';
import { extend } from '../../src/index';

const debug = require('debug')('afx-request:test');

const writeData = (data, res) => {
  res.setHeader('access-control-allow-origin', '*');
  res.setHeader('access-control-allow-headers', 'Content-Type,traceId,hahaha');
  res.send(data);
};

describe('extendOption', () => {
  let server;
  beforeAll(async () => {
    server = await createTestServer();
  });
  afterAll(() => {
    server.close();
  });

  const prefix = api => `${server.url}${api}`;

  it('should update option', async () => {
    server.options('/test/extendoptions', (req, res) => {
      writeData('ok', res);
    });
    server.get('/test/extendoptions', (req, res) => {
      writeData({ ...req.query, ...req.headers }, res);
    });
    const req = extend({
      timeout: 1000,
      headers: {
        traceId: '10000',
      },
      params: {
        parama: 'a',
      },
    });
    req.extendOptions({
      timeout: 2000,
      headers: {
        traceId: '20000',
        hahaha: '2222',
      },
      params: {
        paramb: 'b',
      },
    });

    const res = await req(prefix('/test/extendoptions'));
    expect(res.parama).toBe('a');
    expect(res.paramb).toBe('b');
    expect(res.traceid).toBe('20000');
    expect(res.hahaha).toBe('2222');
  });
});
