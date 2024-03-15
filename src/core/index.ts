import _download from 'downloadjs';

import {
  ResponseError,
  getFileNameFromHeaders as _getFileNameFromHeaders,
  mergeRequestOptions,
  mergeUploadOptions,
  timeout2Throw,
} from '../helpers';
import { AbortController } from './abortController';
import addFix from './lib/addFix';
import parseResponse from './lib/parseResponse';
import simpleBody from './lib/simpleBody';
import simpleQuery from './lib/simpleQuery';
import _upload, { IUploadRequestOptions } from './upload';

export type IResponseType = 'json' | 'text' | 'blob' | 'arrayBuffer' | 'formData';
export interface IOptions extends RequestInit {
  /** post 类型, 用来简化 content-Type, 默认 json，当指定为 other 时，不会对 body 做任何处理 */
  requestType?: 'json' | 'form' | 'other';
  /** query 参数 */
  params?: object | URLSearchParams;
  /** query 参数拼接函数 */
  paramsSerializer?: (params: object) => string;
  /** 服务端返回的数据类型, 用来解析数据, 默认 json */
  responseType?: IResponseType;
  /** 超时时长, 默认 , 单位毫秒 */
  timeout?: number;
  /** 统一的异常处理，供开发者对请求发生的异常做统一处理 */
  errorHandler?: (error: ResponseError) => void;
  /** 前缀, 一般用于覆盖统一设置的 prefix */
  prefix?: string;
  /** 后缀, 比如某些场景 api 需要统一加 .json */
  suffix?: string;
  /** 当 responseType 为 'json', 对请求结果做 JSON.parse 出错时是否抛出异常 */
  throwErrIfParseFail?: boolean;
  /** 是否对 response 做解析处理，默认 true */
  parseResponse?: boolean;
  /** 是否获取 response 源，默认 false */
  getResponse?: boolean;
  /** 是否去掉请求返回的值为 null 的 key，默认为 true（按照规范不应该返回 null 值 key，会造成前端初始值赋值异常） */
  filterResponseNullKeys?: boolean;
  /** 下载时的选项 */
  download?: {
    /** 指定下载文件的名称，默认会从 Content-Disposition header 中获取 */
    fileName?: string;
    /** 指定下载文件的类型，例如 text/plain */
    fileMimeType?: string;
    /** 指定获取文件名称的函数 */
    getFileNameFromHeaders?: (headers: Headers) => string;
  };
}

class Core {
  private initOptions: IOptions;

  constructor(initOptions: IOptions = {}) {
    this.initOptions = initOptions;
  }

  extendOptions(options: IOptions = {}) {
    this.initOptions = mergeRequestOptions(this.initOptions, options);
  }

  request(url: string, options: IOptions = {}) {
    if (typeof url !== 'string') {
      throw new TypeError('url must be a string.');
    }
    const reqOptions = simpleBody(mergeRequestOptions(this.initOptions, options));

    // 将 method 改为大写
    reqOptions.method = reqOptions.method ? reqOptions.method.toUpperCase() : 'GET';

    // 设置 credentials 默认值为 same-origin，确保当开发者没有设置时，各浏览器对请求是否发送 cookies 保持一致的行为
    // - omit: 从不发送cookies.
    // - same-origin: 只有当URL与响应脚本同源才发送 cookies、 HTTP Basic authentication 等验证信息.(浏览器默认值,在旧版本浏览器，例如safari 11依旧是omit，safari 12已更改)
    // - include: 不论是不是跨域的请求,总是发送请求资源域在本地的 cookies、 HTTP Basic authentication 等验证信息.
    reqOptions.credentials = reqOptions.credentials || 'same-origin';

    url = addFix(url, reqOptions);
    url = simpleQuery(url, reqOptions.params, reqOptions.paramsSerializer);

    const req = { url, options: reqOptions };
    const { timeout } = reqOptions;
    let controller: AbortController;
    if (!reqOptions.signal) {
      controller = new AbortController();
      reqOptions.signal = controller.signal;
    }

    if (!fetch) {
      throw new Error('Global fetch not exist!');
    }

    const reqArray = [fetch(url, reqOptions)];
    if (timeout > 0) {
      reqArray.push(timeout2Throw(timeout, req, controller));
    }
    return parseResponse(Promise.race(reqArray), req);
  }

  upload(url: string, options: IUploadRequestOptions) {
    const uploadOpions = mergeUploadOptions(this.initOptions, options);

    // 将 method 改为大写
    uploadOpions.method = uploadOpions.method ? uploadOpions.method.toUpperCase() : 'POST';

    url = addFix(url, uploadOpions);
    url = simpleQuery(url, uploadOpions.params, uploadOpions.paramsSerializer);

    return _upload(url, uploadOpions);
  }

  download(url: string, options: IOptions) {
    const responseType: IResponseType = 'blob';
    const downloadOptions = {
      ...options,
      responseType,
      getResponse: true,
      parseResponse: true,
    };
    let {
      fileName,
      fileMimeType,
      getFileNameFromHeaders = _getFileNameFromHeaders,
    } = downloadOptions.download || {};
    return this.request(url, downloadOptions).then(
      ({ data, response }: { data: Blob; response: Response }) => {
        fileName = fileName || getFileNameFromHeaders(response.headers);
        return _download(data, fileName, fileMimeType);
      }
    );
  }
}

export default Core;
