// https://github.com/react-component/upload/blob/master/src/request.ts

export interface IUploadRequestError extends Error {
  status?: number;
  method?: string;
  url?: string;
}

export interface IUploadProgressEvent extends ProgressEvent {
  percent: number;
}

export interface IUploadRequestOptions<T = any> {
  /** 请求类型，默认 POST */
  method?: string;
  /** query 参数 */
  params?: object | URLSearchParams;
  /** query 参数拼接函数 */
  paramsSerializer?: (params: object) => string;
  /** 上传文件 */
  file: File;
  /** 上传文件名称 */
  filename?: string;
  /** 上传文件时发送的额外参数 */
  data?: object;
  /**
   * 可以直接传一个 formData, formData 的优先级最高
   * 指定 formData 后 file filename data 这 3 个属性会失效
   **/
  formData?: FormData;
  /** 请求 headers 参数 */
  headers?: HeadersInit;
  /** 上传请求时是否携带 cookie */
  withCredentials?: boolean;
  /** 获取文件上传进度 */
  onProgress?: (event: IUploadProgressEvent) => void;
  /** 上传失败的回调函数 */
  onError?: (event: IUploadRequestError | ProgressEvent, body?: T) => void;
  /** 上传终断（abort）的回调函数 */
  onAbort?: (event: ProgressEvent) => void;
  /** 上传成功的回调函数 */
  onSuccess?: (body: T, xhr: XMLHttpRequest) => void;
}

const getError = (url: string, options: IUploadRequestOptions, xhr: XMLHttpRequest) => {
  const msg = `cannot ${options.method} ${url} ${xhr.status}'`;
  const err = new Error(msg) as IUploadRequestError;
  err.status = xhr.status;
  err.method = options.method;
  err.url = url;
  return err;
};

const getBody = (xhr: XMLHttpRequest) => {
  const text = xhr.responseText || xhr.response;
  if (!text) {
    return text;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};
/**
 * 上传文件（基于 XMLHttpRequest 封装，可通过 onProgress 获取上传进度）
 *
 * @param {string} url 上传请求地址
 * @param {IUploadRequestOptions} options 上传参数
 * @return {*} 返回一个 abort 函数，支持终止请求
 */
const upload = (url: string, options: IUploadRequestOptions) => {
  const xhr = new XMLHttpRequest();

  const {
    onProgress,
    onError = () => {},
    onSuccess = () => {},
    onAbort = () => {},
    data,
    file,
  } = options;

  if (onProgress && xhr.upload) {
    xhr.upload.addEventListener('progress', function progress(e) {
      let percent: number;
      if (e.total > 0) {
        percent = (e.loaded / e.total) * 100;
      }
      onProgress({ ...e, percent });
    });
  }

  let { formData } = options;
  if (!formData) {
    formData = new FormData();
    if (data) {
      for (const key of Object.keys(data)) {
        const value = data[key];
        // support key-value array data
        if (Array.isArray(value)) {
          for (const item of value) {
            // { list: [ 11, 22 ] }
            // formData.append('list[]', 11);
            formData.append(`${key}[]`, item);
          }
          continue;
        }

        formData.append(key, data[key]);
      }
    }

    if (file instanceof Blob) {
      formData.append(options.filename || 'file', file, file.name);
    } else {
      formData.append(options.filename || 'file', file);
    }
  }

  xhr.onerror = function error(e) {
    onError(e);
  };

  xhr.addEventListener('abort', function error(e) {
    onAbort(e);
  });

  xhr.addEventListener('load', function onload() {
    // allow success when 2xx status
    // see https://github.com/react-component/upload/issues/34
    if (xhr.status < 200 || xhr.status >= 300) {
      return onError(getError(url, options, xhr), getBody(xhr));
    }

    return onSuccess(getBody(xhr), xhr);
  });

  xhr.open(options.method, url, true);

  // Has to be after `.open()`. See https://github.com/enyo/dropzone/issues/179
  if (options.withCredentials && 'withCredentials' in xhr) {
    xhr.withCredentials = true;
  }

  const headers = options.headers || {};

  // when set headers['x-requested-with'] = null , can close default XHR header
  // see https://github.com/react-component/upload/issues/33
  if (headers['x-requested-with'] !== null) {
    xhr.setRequestHeader('x-requested-with', 'XMLHttpRequest');
  }

  for (const h of Object.keys(headers)) {
    if (headers[h] !== null) {
      xhr.setRequestHeader(h, headers[h]);
    }
  }

  xhr.send(formData);

  return {
    abort() {
      xhr.abort();
    },
  };
};

export default upload;
