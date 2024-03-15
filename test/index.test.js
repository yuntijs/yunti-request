import createTestServer from 'create-test-server';
import { fetch as whatwgFetch } from 'whatwg-fetch';
import request, { extend, fetch } from '../src/index';

const debug = require('debug')('afx-request:test');
const writeData = (data, res) => {
  res.setHeader('access-control-allow-origin', '*');
  res.send(data);
};

describe('test fetch:', () => {
  let server;

  beforeAll(async () => {
    server = await createTestServer();
  });

  afterAll(() => {
    server.close();
  });

  const prefix = api => `${server.url}${api}`;

  // 测试请求方法
  it('test methodType', async () => {
    server.get('/test/requestType', (req, res) => {
      writeData(req.query, res);
    });

    let response = await request(prefix('/test/requestType'), {
      method: 'get',
      params: {
        foo: 'foo',
      },
    });
    expect(response.foo).toBe('foo');

    response = await request(prefix('/test/requestType'), {
      method: null,
      params: {
        foo: 'foo',
      },
    });
    expect(response.foo).toBe('foo');

    response = await request(prefix('/test/requestType'));
    expect(response).toStrictEqual({});
  }, 5000);

  // 测试请求类型
  it('test requestType', async done => {
    server.post('/test/requestType', (req, res) => {
      writeData(req.body, res);
    });

    let response = await request(prefix('/test/requestType'), {
      method: 'post',
      requestType: 'json',
    });
    expect(response).toStrictEqual({});

    response = await request(prefix('/test/requestType'), {
      method: 'post',
      requestType: 'form',
      body: {
        hello: 'world',
      },
    });
    expect(response.hello).toBe('world');

    response = await request(prefix('/test/requestType'), {
      method: 'post',
      requestType: 'json',
      body: {
        hello: 'world2',
      },
    });
    expect(response.hello).toBe('world2');

    response = await request(prefix('/test/requestType'), {
      method: 'post',
      body: {},
    });
    expect(response).toEqual({});

    response = await request(prefix('/test/requestType'), {
      method: 'post',
      body: 'hehe',
    });
    expect(response).toBe('hehe');
    done();
  });

  // 测试非 web 环境无 fetch 情况
  it('test fetch not exist', async done => {
    expect.assertions(1);
    server.post('/test/requestType', (req, res) => {
      writeData(req.body, res);
    });
    const oldFetch = window.fetch;
    window.fetch = null;
    try {
      await request(prefix('/test/requestType'), {
        method: 'post',
        requestType: 'json',
      });
    } catch (error) {
      expect(error.message).toBe('Global fetch not exist!');
      window.fetch = oldFetch;
      done();
    }
  });

  // 测试返回类型 #TODO 更多类型
  it('test invalid responseType', async () => {
    expect.assertions(2);
    server.post('/test/invalid/response', (req, res) => {
      writeData('hello world', res);
    });
    try {
      await request(prefix('/test/invalid/response'), {
        method: 'post',
        responseType: 'json',
        body: { a: 1 },
        throwErrIfParseFail: true,
      });
    } catch (error) {
      expect(error.message).toBe('JSON.parse fail');
      expect(error.data).toBe('hello world');
    }
  });
  it('test responseType', async done => {
    expect.assertions(5);
    server.post('/test/responseType', (req, res) => {
      writeData(req.body, res);
    });
    server.get('/test/responseType', (req, res) => {
      if (req.query.type === 'blob') {
        const data = new Blob(['aaaaa']);
        writeData(data, res);
      } else {
        writeData(req.body, res);
      }
    });

    const extendRequest = extend({});

    let response = await extendRequest(prefix('/test/responseType'), {
      method: 'post',
      responseType: 'json',
      body: { a: 11 },
    });
    expect(response.a).toBe(11);

    response = await extendRequest(prefix('/test/responseType'), {
      method: 'post',
      responseType: 'text',
      body: { a: 12 },
    });
    expect(typeof response === 'string').toBe(true);

    // fetch 从 whatwg-fetch 更换成 isomorphic-fetch，默认导入的是 node-fetch，responseType 不支持 formData、arrayBuffer、blob 等方法
    response = await extendRequest(prefix('/test/responseType'), {
      method: 'post',
      responseType: 'formData',
      body: { a: 13 },
    });
    expect(response instanceof FormData).toBe(true);

    response = await request(prefix('/test/responseType'), {
      method: 'post',
      responseType: 'arrayBuffer',
      body: { a: 14 },
    });
    expect(response instanceof ArrayBuffer).toBe(true);

    try {
      response = await request(prefix('/test/responseType'), {
        responseType: 'other',
        params: { type: 'blob' },
      });
    } catch (error) {
      expect(error.message).toBe('responseType not support');
      done();
    }
  });

  // 测试拼接参数
  it('test queryParams', async () => {
    server.get('/test/queryParams', (req, res) => {
      writeData(req.query, res);
    });

    const array = ['hello', 'world'];
    const response = await request(prefix('/test/queryParams'), {
      params: {
        hello: 'world3',
        wang: 'hou',
        array,
      },
    });
    expect(response.wang).toBe('hou');
    expect(response.hello).toBe('world3');
    expect(JSON.stringify(response.array)).toBe(JSON.stringify(array));

    const reponse1 = await request(prefix('/test/queryParams'), {
      params: new URLSearchParams('foo=hello'),
    });

    expect(reponse1.foo).toBe('hello');

    const response2 = await request(prefix('/test/queryParams'), {
      params: {
        bar: 'woo',
      },
      paramsSerializer: params => `bar=${params.bar}&car=pengpeng`,
    });
    expect(response2.bar).toBe('woo');
    expect(response2.car).toBe('pengpeng');

    const response3 = await request(prefix('/test/queryParams'), {
      params: 'stringparams',
    });
    expect(response3[0]).toBe('stringparams');
  }, 5000);

  it('test extends', async () => {
    server.get('/test/method', (req, res) => {
      writeData({ method: req.method }, res);
    });

    server.post('/test/method', (req, res) => {
      writeData({ method: req.method }, res);
    });

    const extendRequest = extend({ method: 'POST' });

    const response = await extendRequest(prefix('/test/method'));
    expect(response.method).toBe('POST');

    const extendRequest2 = extend();
    const response2 = await extendRequest2(prefix('/test/method'));
    expect(response2.method).toBe('GET');
  });

  // 测试异常捕获
  it('test exception', async () => {
    server.get('/test/exception', (req, res) => {
      res.setHeader('access-control-allow-origin', '*');
      res.status(401);
      res.send({ hello: 11 });
    });
    // 测试访问一个不存在的网址
    try {
      await request(prefix('/test/exception'), {
        params: {
          hello: 'world3',
          wang: 'hou',
        },
      });
    } catch (error) {
      expect(error.name).toBe('ResponseError');
      expect(error.response.status).toBe(401);
    }
  }, 6000);

  // 测试错误处理方法
  it('test errorHandler', async done => {
    expect.assertions(3);
    server.get('/test/errorHandler', (req, res) => {
      res.setHeader('access-control-allow-origin', '*');
      res.status(401);
      res.send({ errorCode: '021', errorMsg: 'some thing wrong' });
    });

    const codeMap = {
      '021': '发生错误啦',
      '022': '发生大大大大错误啦',
    };

    const errorHandler = error => {
      const { response, data } = error;
      if (response.status === 401) {
        // message.error(codeMap[data.errorCode]);
        throw codeMap[data.errorCode];
      } else {
        return Promise.reject(error);
      }
    };

    const extendRequest = extend({
      prefix: server.url,
      errorHandler,
    });

    try {
      await extendRequest.get('/test/errorHandler');
    } catch (error) {
      expect(error).toBe('发生错误啦');
    }

    try {
      let response = await extendRequest.get('/test/errorHandler', {
        errorHandler: error => '返回数据',
      });
      expect(response).toBe('返回数据');
      response = await extendRequest.get('/test/errorHandler', {
        errorHandler: error => {
          throw new Error('统一错误处理被覆盖啦');
        },
      });
      // throw response;
    } catch (error) {
      expect(error.message).toBe('统一错误处理被覆盖啦');
      done();
    }
  });

  // 测试前后缀
  it('test prefix and suffix', async () => {
    server.get('/prefix/api/hello', (req, res) => {
      writeData({ success: true }, res);
    });

    server.get('/api/hello.json', (req, res) => {
      writeData({ success: true }, res);
    });

    let response = await request('/hello', {
      prefix: `${server.url}/prefix/api`,
    });
    expect(response.success).toBe(true);

    response = await request(prefix('/api/hello'), {
      suffix: '.json',
      params: { hello: 'world' },
    });
    expect(response.success).toBe(true);
  });

  // 测试 json
  it('test array json', async () => {
    server.post('/api/array/json', (req, res) => {
      writeData({ data: req.body }, res);
    });

    // server.delete throw error: Cross origin http://localhost forbidden
    server.all('/api/array/json/delete', (req, res) => {
      writeData({ data: req.body }, res);
    });

    let response = await request(prefix('/api/array/json'), {
      method: 'post',
      body: ['hello', { world: 'two' }],
    });

    expect(response.data[0]).toBe('hello');
    expect(response.data[1].world).toBe('two');

    response = await request(prefix('/api/array/json/delete'), {
      method: 'delete',
      body: ['1', '2'],
    });
    expect(response.data[0]).toBe('1');
    expect(response.data[1]).toBe('2');
  });
});

describe('test http error', () => {
  let server;

  beforeAll(async () => {
    server = await createTestServer();
  });

  afterAll(() => {
    server.close();
  });

  it('error handler should return request in error object', async done => {
    expect.assertions(3);
    server.get('/api/error', (req, res) => {
      res.setHeader('access-control-allow-origin', '*');
      res.status(500);
      res.send({ errorMessage: 'server error' });
    });

    try {
      await request(`${server.url}/api/error`, { hello: 'world' });
    } catch (e) {
      const { response, request: req } = e;
      expect(response.status).toBe(500);
      expect(req.url).toBe(`${server.url}/api/error`);
      expect(req.options.hello).toBe('world');
      done();
    }
  });
});

// 测试rpc
xdescribe('test rpc:', () => {
  it('test hello', () => {
    expect(request.rpc('wang').hello).toBe('wang');
  });
});
