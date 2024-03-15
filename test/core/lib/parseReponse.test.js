import parseResponse from '../../../src/core/lib/parseResponse';
import { fetch } from '../../../src';
import createTestServer from 'create-test-server';

const writeData = (data, res) => {
  res.setHeader('access-control-allow-origin', '*');
  res.send(data);
};

describe('test parseReponse core lib', () => {
  let server;
  beforeAll(async () => {
    server = await createTestServer();
  });
  afterAll(() => {
    server.close();
  });
  const prefix = api => `${server.url}${api}`;

  it('should filter response null keys', async done => {
    const route = '/test/fetch';
    server.get(route, (req, res) => {
      writeData(
        {
          key1: 1,
          key2: null,
          key3: { value: null },
        },
        res
      );
    });
    const req = {
      url: prefix(route),
      options: { filterResponseNullKeys: true },
    };

    const res = await parseResponse(fetch(req.url, req.options), req);
    expect(res.key1).toBe(1);
    expect(res.key2).toBe(undefined);
    expect(res.key3).toEqual({});
    done();
  });
});
