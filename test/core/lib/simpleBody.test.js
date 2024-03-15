import simpleBody from '../../../src/core/lib/simpleBody';
import querystring from 'query-string';

describe('test simpleBody core lib', () => {
  it('should has form header when requestType is form', async done => {
    const options = {
      method: 'post',
      requestType: 'form',
      body: { a: 1, b: [1, 2, 3, 4] },
    };
    const reqOptions = simpleBody(options);
    expect(reqOptions.headers).toEqual({
      accept: 'application/json',
      'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
    });
    expect(reqOptions.body).toBe(querystring.stringify(options.body));
    expect(querystring.stringify(options.body)).toBe('a=1&b=1&b=2&b=3&b=4');
    done();
  });
});
