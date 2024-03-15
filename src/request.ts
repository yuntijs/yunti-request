import Core, { IOptions } from './core';
import { IUploadRequestOptions } from './core/upload';

export type IRequestResponse<T = any> = {
  data: T;
  response: Response;
};

export interface IRequestInstance<R = false> {
  <T = any>(url: string, options: IOptions): Promise<IRequestResponse<T>>;
  <T = any>(url: string, options: IOptions): Promise<T>;
  upload: (url: string, options: IUploadRequestOptions) => { abort(): void };
  download: IRequestInstance<R>;
  get: IRequestInstance<R>;
  post: IRequestInstance<R>;
  delete: IRequestInstance<R>;
  put: IRequestInstance<R>;
  patch: IRequestInstance<R>;
  head: IRequestInstance<R>;
  options: IRequestInstance<R>;
  rpc: IRequestInstance<R>;
  extendOptions: (options: IOptions) => void;
}

const request = (initOptions: IOptions): IRequestInstance => {
  const coreInstance = new Core(initOptions);
  const requestInstance = (url: string, options: IOptions) => coreInstance.request(url, options);
  requestInstance.upload = (url: string, options: IUploadRequestOptions) =>
    coreInstance.upload(url, options);
  requestInstance.download = (url: string, options: IOptions) =>
    coreInstance.download(url, options);

  // 请求语法糖
  const METHODS = ['get', 'post', 'delete', 'put', 'patch', 'head', 'options', 'rpc'];
  for (const method of METHODS) {
    requestInstance[method] = (url: string, options: IOptions) =>
      requestInstance(url, { ...options, method });
  }

  requestInstance.extendOptions = coreInstance.extendOptions.bind(coreInstance);

  return requestInstance as IRequestInstance;
};
/**
 * extend 方法参考了ky, 让用户可以定制配置.
 *
 * @param {IOptions} initOptions 初始化配置
 */
export const extend = (initOptions: IOptions) => request(initOptions);

export const fetch = request({ parseResponse: false });

export default request({});
