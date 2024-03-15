import { parse, stringify } from 'qs';

import { IOptions } from '../core';
import { IUploadRequestOptions } from '../core/upload';

export interface IRequest {
  url: string;
  options: IOptions;
}
export type IResponse = Response | undefined;

/**
 * 请求异常
 */
export class RequestError extends Error {
  name: string;
  request: IRequest;
  type: string;

  constructor(text: string, request: IRequest, type = 'RequestError') {
    super(text);
    this.name = 'RequestError';
    this.request = request;
    this.type = type;
  }
}

/**
 * 响应异常
 */
export class ResponseError<D = any> extends Error {
  name: string;
  data: D;
  response: Response | undefined;
  request: IRequest;
  type: string;

  constructor(
    response: Response | undefined,
    text: string,
    data: D,
    request: IRequest,
    type = 'ResponseError'
  ) {
    super(text || response.statusText);
    this.name = 'ResponseError';
    this.data = data;
    this.response = response;
    this.request = request;
    this.type = type;
  }
}

export const timeout2Throw = (
  msec: number,
  request: IRequest,
  controller?: AbortController
): Promise<Response> => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new RequestError(`timeout of ${msec}ms exceeded`, request, 'Timeout'));
      controller && controller.abort();
    }, msec);
  });
};

export const getEnv = () => {
  let env: string;
  // Only Node.JS has a process variable that is of [[Class]] process
  if (typeof process !== 'undefined' && toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    env = 'NODE';
  }
  if (typeof XMLHttpRequest !== 'undefined') {
    env = 'BROWSER';
  }
  return env;
};

export const isArray = (val: any) => {
  return typeof val === 'object' && Object.prototype.toString.call(val) === '[object Array]';
};

export const isURLSearchParams = (val: any) => {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
};

export const isDate = (val: any) => {
  return typeof val === 'object' && Object.prototype.toString.call(val) === '[object Date]';
};

export const isObject = (val: any) => {
  return val !== null && typeof val === 'object';
};

export const forEach2ObjArr = (
  targets: any,
  callback: (target: any, key: string, targets: any) => void
) => {
  if (!targets) return;

  if (typeof targets !== 'object') {
    targets = [targets];
  }

  if (isArray(targets)) {
    for (let i = 0; i < targets.length; i++) {
      callback.call(null, targets[i], i, targets);
    }
  } else {
    for (const key in targets) {
      if (Object.prototype.hasOwnProperty.call(targets, key)) {
        callback.call(null, targets[key], key, targets);
      }
    }
  }
};

export const getParamObject = (val: any) => {
  if (isURLSearchParams(val)) {
    return parse(val.toString(), { strictNullHandling: true });
  }
  if (typeof val === 'string') {
    return [val];
  }
  return val;
};

export const reqStringify = (val: any, options?: any) => {
  return stringify(
    val,
    Object.assign({ arrayFormat: 'repeat', strictNullHandling: true }, options)
  );
};

/**
 * merge and lowercase http headers
 * https://stackoverflow.com/questions/5258977/are-http-headers-case-sensitive
 * Each header field consists of a name followed by a colon (":") and the field value. Field names are case-insensitive.
 *
 * @param {HeadersInit} [headers={}] original headers
 * @param {HeadersInit} [headers2Merge={}] wait to merge headers
 * @return {HeadersInit} merged headers
 */
export const mergeHeaders = (headers: HeadersInit = {}, headers2Merge: HeadersInit = {}) => {
  const mergedHeaders: HeadersInit = {};
  for (const h of [headers, headers2Merge]) {
    for (const key of Object.keys(h)) {
      mergedHeaders[key.toLocaleLowerCase()] = h[key];
    }
  }
  return mergedHeaders;
};

export const mergeRequestOptions = (options: IOptions, options2Merge: IOptions): IOptions => {
  return {
    ...options,
    ...options2Merge,
    headers: mergeHeaders(options.headers, options2Merge.headers),
    params: {
      ...getParamObject(options.params),
      ...getParamObject(options2Merge.params),
    },
    method: (options2Merge.method || options.method || 'get').toLowerCase(),
  };
};

export const mergeUploadOptions = (
  options: IOptions,
  uploadOptions: IUploadRequestOptions
): IUploadRequestOptions => {
  return {
    ...uploadOptions,
    headers: mergeHeaders(options.headers, uploadOptions.headers),
    params: {
      ...getParamObject(options.params),
      ...getParamObject(uploadOptions.params),
    },
    method: (uploadOptions.method || options.method || 'POST').toLowerCase(),
    paramsSerializer: options.paramsSerializer || uploadOptions.paramsSerializer,
  };
};

export const getFileNameFromHeaders = (headers: Headers) => {
  // get fileName from Content-Disposition header
  const disposition = headers.get('Content-Disposition');
  if (disposition) {
    const filenameRegex = /filename[^\n;=]*=((["']).*?\2|[^\n;]*)/i;
    const matches = filenameRegex.exec(disposition);
    if (matches !== null && matches[1]) {
      return matches[1].replaceAll(/["']/g, '');
    }
  }
};
