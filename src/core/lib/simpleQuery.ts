import {
  isArray,
  isURLSearchParams,
  forEach2ObjArr,
  isObject,
  isDate,
  reqStringify,
} from '../../helpers';

export const paramsSerialize = (
  params?: object | URLSearchParams,
  paramsSerializer?: (params: object) => string
) => {
  if (!params) {
    return;
  }
  if (paramsSerializer) {
    return paramsSerializer(params);
  }
  if (isURLSearchParams(params)) {
    return params.toString();
  }
  if (isArray(params)) {
    const jsonStringifiedParams = [];
    forEach2ObjArr(params, function (item) {
      if (item === null || typeof item === 'undefined') {
        jsonStringifiedParams.push(item);
      } else {
        jsonStringifiedParams.push(isObject(item) ? JSON.stringify(item) : item);
      }
    });
    // a: [1,2,3] => a=1&a=2&a=3
    return reqStringify(jsonStringifiedParams, { arrayFormat: 'repeat', strictNullHandling: true });
  }
  const jsonStringifiedParams = {};
  forEach2ObjArr(params, function (value, key) {
    let jsonStringifiedValue = value;
    if (value === null || typeof value === 'undefined') {
      jsonStringifiedParams[key] = value;
    } else if (isDate(value)) {
      jsonStringifiedValue = value.toISOString();
    } else if (isArray(value)) {
      jsonStringifiedValue = value;
    } else if (isObject(value)) {
      jsonStringifiedValue = JSON.stringify(value);
    }
    jsonStringifiedParams[key] = jsonStringifiedValue;
  });
  return reqStringify(jsonStringifiedParams, { arrayFormat: 'repeat', strictNullHandling: true });
};

/**
 * 对请求参数做处理，实现 query 简化
 *
 * @param {string} url 地址
 * @param {(object | URLSearchParams)} [params] query 参数
 * @param {(params: object) =>string} [paramsSerializer] query 参数拼接函数
 * @return {string} 处理后的 url
 */
const simpleQuery = (
  url: string,
  params?: object | URLSearchParams,
  paramsSerializer?: (params: object) => string
) => {
  // 支持类似axios 参数自动拼装, 其他method也可用, 不冲突.
  const serializedParams = paramsSerialize(params, paramsSerializer);
  if (serializedParams) {
    const urlSign = url.indexOf('?') !== -1 ? '&' : '?';
    url = `${url}${urlSign}${serializedParams}`;
  }
  return url;
};

export default simpleQuery;
