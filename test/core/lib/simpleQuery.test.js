import simpleQuery, { paramsSerialize } from '../../../src/core/lib/simpleQuery';

describe('test simpleQuery core lib', () => {
  it('url should contain "a=1"', async done => {
    const url = '/api/test';
    const params = { a: 1 };
    expect(simpleQuery(url, params)).toBe('/api/test?a=1');
    done();
  });
  it('url should contain "b=2"', async done => {
    const url = '/api/test?a=1';
    const params = { b: 2 };
    expect(simpleQuery(url, params)).toBe('/api/test?a=1&b=2');
    done();
  });
});

describe('test paramsSerialize', () => {
  it('should support object params', () => {
    expect(paramsSerialize({ a: null, b: undefined, c: 1, d: 'asdf' })).toBe('a&c=1&d=asdf');
    expect(paramsSerialize([null, undefined, 1, 2])).toBe('0&2=1&3=2');
  });

  it('should support array params', () => {
    expect(paramsSerialize([1, 2, 3])).toBe('0=1&1=2&2=3');
  });

  it('should support nesting object params', () => {
    expect(paramsSerialize({ a: { b: 1 } })).toBe('a=%7B%22b%22%3A1%7D');
  });

  it('should support nesting Date params', () => {
    expect(paramsSerialize({ a: new Date('05 October 2011 14:48 UTC') })).toBe(
      'a=2011-10-05T14%3A48%3A00.000Z'
    );
  });

  it('should support nesting array params', () => {
    expect(paramsSerialize([{ a: 1 }, { b: { c: 2 } }])).toBe(
      '0=%7B%22a%22%3A1%7D&1=%7B%22b%22%3A%7B%22c%22%3A2%7D%7D'
    );

    expect(paramsSerialize({ a: [1, 2, 3] })).toBe('a=1&a=2&a=3');
  });

  it('should be undefined when params is null、undefined、{}、[]', () => {
    expect(paramsSerialize(null)).toBe(undefined);
    expect(paramsSerialize(undefined)).toBe(undefined);

    expect(paramsSerialize([undefined])).toBe('');
    expect(paramsSerialize([])).toBe('');
    expect(paramsSerialize({})).toBe('');
  });

  it('should support URLSearchParams params', () => {
    const url = new URL('https://a.com?a=1&b=2');
    const params = new URLSearchParams(url.search.slice(1));
    params.append('c', 3);

    expect(paramsSerialize(params)).toBe('a=1&b=2&c=3');
  });

  it('should support paramsSerializer', () => {
    expect(paramsSerialize({ a: 1 }, val => val.a)).toBe(1);
  });
});
