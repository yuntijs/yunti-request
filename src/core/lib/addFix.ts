import { IOptions } from '..';

/**
 * 为 url 增加前后缀
 *
 * @param {string} url 地址
 * @param {IOptions} [options={}] request 参数
 * @return {string} 处理后端地址
 */
const addFix = (url: string, options: IOptions = {}) => {
  const { prefix, suffix } = options;
  if (prefix) {
    url = `${prefix}${url}`;
  }
  if (suffix) {
    url = `${url}${suffix}`;
  }
  return url;
};

export default addFix;
