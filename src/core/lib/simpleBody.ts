import { IOptions } from '../';
import { reqStringify } from '../../helpers';

// 对请求参数做处理，实现 query 简化、 post 简化
const simpleBody = (options: IOptions) => {
  const _options = { ...options };
  const { method = 'get' } = _options;

  if (['post', 'put', 'patch', 'delete'].indexOf(method.toLowerCase()) === -1) {
    return _options;
  }

  const { requestType = 'json', body } = _options;
  if (!body) {
    return _options;
  }

  const dataType = Object.prototype.toString.call(body);
  if (dataType === '[object Object]' || dataType === '[object Array]') {
    if (requestType === 'json') {
      _options.headers = {
        accept: 'application/json',
        'content-type': 'application/json;charset=UTF-8',
        ..._options.headers,
      };
      _options.body = JSON.stringify(body);
    } else if (requestType === 'form') {
      _options.headers = {
        accept: 'application/json',
        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
        ..._options.headers,
      };
      _options.body = reqStringify(body, { arrayFormat: 'repeat', strictNullHandling: true });
    }
    return _options;
  }
  // 其他 requestType 自定义 header
  _options.headers = {
    accept: 'application/json',
    ..._options.headers,
  };

  return _options;
};

export default simpleBody;
