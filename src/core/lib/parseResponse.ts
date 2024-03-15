import { ResponseError, getEnv, RequestError, IRequest } from '../../helpers';

const parseResponseFunc = (response: Promise<Response>, request: IRequest) => {
  const { options } = request;
  const {
    responseType = 'json',
    getResponse = false,
    throwErrIfParseFail = false,
    parseResponse = true,
    filterResponseNullKeys = true,
    errorHandler,
  } = options;
  let resClone: Response;
  return response
    .then(res => {
      if (!parseResponse) {
        return res;
      }

      // 只在浏览器环境对 response 做克隆， node 环境如果对 response 克隆会有问题：https://github.com/bitinn/node-fetch/issues/553
      resClone = getEnv() === 'BROWSER' ? res.clone() : res;

      if (responseType === 'json') {
        return res.text().then(text => {
          let data: any;
          try {
            data = JSON.parse(text, (_key, value) => {
              if (!filterResponseNullKeys) {
                return value;
              }
              // 去掉 api 返回的值为 null 的 key
              if (value === null) {
                return undefined;
              }
              return value;
            });
          } catch (error) {
            if (throwErrIfParseFail) {
              throw new ResponseError(resClone, 'JSON.parse fail', text, request, 'ParseError');
            }
            // data = { body: text };
            data = text;
          }
          return data;
        });
      }
      try {
        // 其他如 text, blob, arrayBuffer, formData
        return res[responseType]();
      } catch (e) {
        throw new ResponseError(resClone, 'responseType not support', null, request, 'ParseError');
      }
    })
    .then(data => {
      if (!resClone) {
        return data;
      }

      if (resClone.status >= 200 && resClone.status < 300) {
        // 提供源response, 以便自定义处理
        if (getResponse) {
          return { data, response: resClone };
        }
        return data;
      }
      throw new ResponseError(resClone, 'http error', data, request, 'HttpError');
    })
    .catch(e => {
      if (e instanceof RequestError || e instanceof ResponseError) {
        throw e;
      }
      // 对未知错误进行处理
      e.request = e.request || request;
      e.response = e.response || resClone || {};
      e.type = e.type || e.name;
      e.data = e.data || undefined;
      throw e;
    })
    .catch(error => {
      if (!errorHandler) {
        throw error;
      }
      try {
        const data = errorHandler(error);
        return data;
      } catch (e) {
        throw e;
      }
    });
};

export default parseResponseFunc;
