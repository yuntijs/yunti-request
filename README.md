<a name="readme-top"></a>

# @yuntijs/request

网络请求库，基于 umi-request (`fetch`) 和 `XMLHttpRequest` 封装，旨在为开发者提供一个统一的 api 调用方式，简化使用，并提供诸如上传、下载、错误处理及超时参数等常用功能.

---

<details>
<summary><kbd>Table of contents</kbd></summary>

#### TOC

- [支持的功能](#支持的功能)
- [与 umi-request, fetch, axios 异同](#与-umi-request-fetch-axios-异同)
- [TODO](#todo)
- [安装](#安装)
- [快速上手](#快速上手)
- [API](#api)
- [请求方法的别名](#请求方法的别名)
- [创建实例](#创建实例)
- [请求配置](#请求配置)
  - [request options 参数](#request-options-参数)
  - [extend options 初始化默认参数，支持以上所有](#extend-options-初始化默认参数支持以上所有)
  - [request.download, 基于 downloadjs 封装，支持以上所有参数](#requestdownload-基于-downloadjs-封装支持以上所有参数)
  - [request.upload options 参数，request.upload 基于 `XMLHttpRequest` 封装，与 request options 参数略有不同](#requestupload-options-参数requestupload-基于-xmlhttprequest-封装与-request-options-参数略有不同)
  - [更新拓展实例默认参数](#更新拓展实例默认参数)
- [响应结构](#响应结构)
- [错误处理](#错误处理)
- [中止请求](#中止请求)
  - [通过 AbortController 来中止请求](#通过-abortcontroller-来中止请求)
- [案例](#案例)
  - [如何获取响应头信息](#如何获取响应头信息)
  - [文件上传](#文件上传)
  - [文件下载](#文件下载)
- [开发和调试](#开发和调试)
- [🤝 Contributing](#-contributing)

####

</details>

## 支持的功能

- url 参数自动序列化
- post 数据提交方式简化
- response 返回处理简化
- api 超时支持
- 统一的错误处理方式
- 类 axios 的取消请求
- 支持 node 环境发送 http 请求
- 文件上传支持，基于 `XMLHttpRequest` 封装，支持获取上传进度
- 文件下载支持，基于 [downloadjs](https://www.npmjs.com/package/downloadjs) 封装

## 与 umi-request, fetch, axios 异同

| 特性       | @yuntijs/request | umi-request    | fetch          | axios          |
| :--------- | :--------------- | :------------- | :------------- | :------------- |
| 实现       | 浏览器原生支持   | 浏览器原生支持 | 浏览器原生支持 | XMLHttpRequest |
| 大小       | -                | 9k             | 4k (polyfill)  | 14k            |
| query 简化 | ✅               | ✅             | ❌             | ✅             |
| post 简化  | ✅               | ✅             | ❌             | ❌             |
| 超时       | ✅               | ✅             | ❌             | ✅             |
| 缓存       | ❌               | ✅             | ❌             | ❌             |
| 错误检查   | ✅               | ✅             | ❌             | ❌             |
| 错误处理   | ✅               | ✅             | ❌             | ✅             |
| 拦截器     | ❌               | ✅             | ❌             | ✅             |
| 前缀       | ✅               | ✅             | ❌             | ❌             |
| 后缀       | ✅               | ✅             | ❌             | ❌             |
| 处理 gbk   | ❌               | ✅             | ❌             | ❌             |
| 中间件     | ❌               | ✅             | ❌             | ❌             |
| 取消请求   | ✅               | ✅             | ❌             | ✅             |
| 上传简化   | ✅               | ❌             | ❌             | ❌             |
| 下载简化   | ✅               | ❌             | ❌             | ❌             |

更多讨论参考[传统 Ajax 已死，Fetch 永生](https://github.com/camsong/blog/issues/2), 如果你有好的建议和需求，请提 [Issue][github-issues-link]

## TODO

> 欢迎 pr

- ✅ 测试用例覆盖 94%+
- ✅ 写文档
- ✅ typescript
- ❌ 中间件
- ❌ 拦截器

仓库地址：<https://github.com/yuntijs/yunti-request>

## 安装

```
yarn add @yuntijs/request
```

## 快速上手

执行 **GET** 请求

```javascript
import request from '@yuntijs/request';

request
  .get('/api/v1/xxx?id=1')
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });

// 也可将 URL 的参数放到 options.params 里
request
  .get('/api/v1/xxx', {
    params: {
      id: 1,
    },
  })
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });
```

执行 **POST** 请求

```javascript
request
  .post('/api/v1/user', {
    body: {
      name: 'Mike',
    },
  })
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });
```

## API

可以通过向 **request** 传参来发起请求

**request(url\[, options])**

```javascript
import request from '@yuntijs/request';

request('/api/v1/xxx', {
  method: 'get',
  params: { id: 1 },
})
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });

request('/api/v1/user', {
  method: 'post',
  body: {
    name: 'Mike',
  },
})
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });
```

## 请求方法的别名

为了方便起见，为所有支持的请求方法提供了别名，`method` 属性不必在配置中指定

**request.get(url\[, options])**

**request.post(url\[, options])**

**request.delete(url\[, options])**

**request.put(url\[, options])**

**request.patch(url\[, options])**

**request.head(url\[, options])**

**request.options(url\[, options])**

## 创建实例

有些通用的配置我们不想每个请求里都去添加，那么可以通过 `extend` 新建一个 @yuntijs/request 实例

**extend(\[options])**

```javascript
import { extend } from '@yuntijs/request';

const request = extend({
  prefix: '/api/v1',
  timeout: 1000,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

request
  .get('/user')
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });
```

以下是可用的实例方法，指定的配置将与实例的配置合并。

**`request.get(url[, options])`**

**`request.post(url[, options])`**

**`request.delete(url[, options])`**

**`request.put(url[, options])`**

**`request.patch(url[, options])`**

**`request.head(url[, options])`**

**`request.options(url[, options])`**

**`request.upload(url[, uploadOptions])`**

**`request.download(url[, options])`**

@yuntijs/request 可以进行一层简单封装后再使用，可参考 [antd-pro](https://github.com/ant-design/ant-design-pro/blob/v2/src/utils/request.js)

## 请求配置

### request options 参数

| 参数                   | 说明                                                                                           | 类型                           | 可选值                            | 默认值      |
| :--------------------- | :--------------------------------------------------------------------------------------------- | :----------------------------- | :-------------------------------- | :---------- |
| method                 | 请求方式                                                                                       | string                         | get , post , put ...              | get         |
| params                 | url query 请求参数                                                                             | object 或 URLSearchParams 对象 | --                                | --          |
| paramsSerializer       | url query 请求参数拼接函数                                                                     | function: params => string     | --                                | --          |
| body                   | 提交的数据                                                                                     | any                            | --                                | --          |
| headers                | fetch 原有参数                                                                                 | object                         | --                                | {}          |
| timeout                | 超时时长，默认毫秒，写操作慎用                                                                 | number                         | --                                | --          |
| prefix                 | 前缀，一般用于覆盖统一设置的 prefix                                                            | string                         | --                                | --          |
| suffix                 | 后缀，比如某些场景 api 需要统一加 .json                                                        | string                         | --                                | --          |
| credentials            | fetch 请求包含 cookies 信息                                                                    | string                         | --                                | same-origin |
| requestType            | post 请求时数据类型，默认 json，当指定为 other 时，不会对 body 做任何处理                      | string                         | json , form , other               | json        |
| parseResponse          | 是否对 response 做处理简化                                                                     | boolean                        | --                                | true        |
| responseType           | 如何解析返回的数据                                                                             | string                         | json , text , blob , formData ... | json        |
| throwErrIfParseFail    | 当 responseType 为 'json', 对请求结果做 JSON.parse 出错时是否抛出异常                          | boolean                        | --                                | false       |
| getResponse            | 是否获取源 response, 返回结果将包裹一层                                                        | boolean                        | --                                | fasle       |
| filterResponseNullKeys | 是否去掉请求返回的值为 null 的 key（按照规范不应该返回 null 值 key，会造成前端初始值赋值异常） | boolean                        | --                                | true        |
| download.fileName      | request.download 时用到的参数，用来指定下载文件的名称                                          | boolean                        | --                                | true        |
| download.fileMimeType  | request.download 时用到的参数，用来指定下载文件的类型                                          | boolean                        | --                                | true        |
| errorHandler           | 异常处理，或者覆盖统一的异常处理                                                               | function(error)                | --                                |             |

fetch 原其他参数有效，详见[fetch 文档](https://github.github.io/fetch/)

### extend options 初始化默认参数，支持以上所有

| 参数   | 说明         | 类型   | 可选值               | 默认值 |
| :----- | :----------- | :----- | :------------------- | :----- |
| method | 请求方式     | string | get , post , put ... | get    |
| params | url 请求参数 | object | --                   | --     |
| body   | 提交的数据   | any    | --                   | --     |
| ...    |              |        |                      |        |

```javascript
{
  // 'method' 是创建请求时使用的方法
  method: 'get', // default

  // 'params' 是即将于请求一起发送的 URL 参数，参数会自动 encode 后添加到 URL 中
  // 类型需为 Object 对象或者 URLSearchParams 对象
  params: { id: 1 },

  // 'paramsSerializer' 开发者可通过该函数对 params 做序列化（注意：此时传入的 params 为合并了 extends 中 params 参数的对象，如果传入的是 URLSearchParams 对象会转化为 Object 对象
  paramsSerializer: function (params) {
    return Qs.stringify(params, { arrayFormat: 'brackets' })
  },

  // 'body' 作为请求主体被发送的数据
  // 适用于这些请求方法 'PUT', 'POST', 和 'PATCH'
  // 必须是以下类型之一：
  // - string, plain object, ArrayBuffer, ArrayBufferView, URLSearchParams
  // - 浏览器专属：FormData, File, Blob
  // - Node 专属： Stream
  body: { name: 'Mike' },

  // 'headers' 请求头
  headers: { 'Content-Type': 'multipart/form-data' },

  // 'timeout' 指定请求超时的毫秒数（0 表示无超时时间）
  // 如果请求超过了 'timeout' 时间，请求将被中断并抛出请求异常
  timeout: 1000,

  // ’prefix‘ 前缀，统一设置 url 前缀
  // ( e.g. request('/user/save', { prefix: '/api/v1' }) => request('/api/v1/user/save') )
  prefix: '',

  // ’suffix‘ 后缀，统一设置 url 后缀
  // ( e.g. request('/api/v1/user/save', { suffix: '.json'}) => request('/api/v1/user/save.json') )
  suffix: '',

  // 'credentials' 发送带凭据的请求
  // 为了让浏览器发送包含凭据的请求（即使是跨域源），需要设置 credentials: 'include'
  // 如果只想在请求URL与调用脚本位于同一起源处时发送凭据，请添加credentials: 'same-origin'
  // 要改为确保浏览器不在请求中包含凭据，请使用credentials: 'omit'
  credentials: 'same-origin', // default

  // 'requestType' 当 body 为对象或者数组时， @yuntijs/request 会根据 requestType 动态添加 headers 和设置 body（可传入 headers 覆盖 Accept 和 Content-Type 头部属性）:
  // 1. requestType === 'json' 时, (默认为 json )
  // options.headers = {
  //   Accept: 'application/json',
  //   'Content-Type': 'application/json;charset=UTF-8',
  //   ...options.headers,
  // }
  // options.body = JSON.stringify(body)
  // 2. requestType === 'form' 时，
  // options.headers = {
  //   Accept: 'application/json',
  //   'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
  //   ...options.headers,
  // };
  // options.body = query-string.stringify(body);
  // 3. 其他 requestType
  // options.headers = {
  //   Accept: 'application/json',
  //   ...options.headers,
  // };
  requestType: 'json', // default

  // ’parseResponse‘ 是否对请求返回的 Response 对象做格式、状态码解析
  parseResponse: true, // default

  // 'responseType': 如何解析返回的数据，当 parseResponse 值为 false 时该参数无效
  // 默认为 'json', 对返回结果进行 Response.text().then( d => JSON.parse(d) ) 解析
  // 其他(text, blob, arrayBuffer, formData), 做 Response[responseType]() 解析
  responseType: 'json', // default

  // 'throwErrIfParseFail': 当 responseType 为 json 但 JSON.parse(data) fail 时，是否抛出异常。默认不抛出异常而返回 Response.text() 后的结果，如需要抛出异常，可设置 throwErrIfParseFail 为 true
  throwErrIfParseFail: false, // default

  // 'getResponse': 是否获取源 Response， 返回结果将包含一层： { data, response }
  getResponse: false, // default

  // 是否去掉请求返回的值为 null 的 key，默认为 true（按照规范不应该返回 null 值 key，会造成前端初始值赋值异常）
  filterResponseNullKeys: true,

  // 下载时的选项
  download: {
    // 下载时的文件名称，默认会自动获取，如果在文件名称中指定扩展名，则以文件名称的扩展名为准，如果不指定会根据文件类型自动添加
    fileName: 'download',
    // 下载时的文件类型，例如 text/plain，一般不需要指定
    fileMimeType: undefined,
    // 指定获取文件名称的函数，默认函数如下：
    getFileNameFromHeaders: (headers: Headers) => {
      // get fileName from Content-Disposition header
      const disposition = headers.get('Content-Disposition')
      if (disposition) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i;
        const matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) {
          return matches[1].replace(/['"]/g, '');
        }
      }
    };
  };

  // 'errorHandler' 统一的异常处理，供开发者对请求发生的异常做统一处理，详细使用请参考下方的错误处理文档
  errorHandler: function(error) { /* 异常处理 */ },
}
```

### request.download, 基于 [downloadjs](https://www.npmjs.com/package/downloadjs) 封装，支持以上所有参数

支持任意 http method 的下载，例如 post，方便下载时传递参数

```javascript
const request = require('@yuntijs/request');
request.download('/download', {
  method: 'POST',
  download: {
    fileName: 'logo',
  },
});
```

### request.upload options 参数，request.upload 基于 `XMLHttpRequest` 封装，与 request options 参数略有不同

\| 参数 | 说明 | 类型 | 可选值 | 默认值 |
\| :--------------- | :------------------------------------------------------------------------------------------ | :------------------------------------------ | :------------------------------- | :----- | --- |
\| method | 请求方式 | string | get , post , put ... | post |
\| params | url query 请求参数 | object 或 URLSearchParams 对象 | -- | -- |
\| paramsSerializer | url query 请求参数拼接函数 | function: params => string | -- | -- |
\| file | 上传的文件 | File | -- | -- |
\| filename | 上传文件的名称 | string | -- | -- |
\| data | 上传文件时 body 中发送的额外参数 | any | -- | -- |
\| formData | 可以直接传一个 formData, formData 的优先级最高，指定后 file filename data 这 3 个属性会失效 | FormData | -- | -- |
\| headers | 上传时指定的 headers | object | -- | {} |
\| prefix | 前缀，一般用于覆盖统一设置的 prefix | string | -- | -- |
\| suffix | 后缀，比如某些场景 api 需要统一加 .json | string | -- | -- |
\| withCredentials | 上传请求时是否携带 cookie | boolean | -- | fasle |
\| onProgress | 获取文件上传进度 | ({percent}: IUploadProgressEvent) => void | -- | - |
\| onError | 上传失败的回调函数 | (event: IUploadRequestError | ProgressEvent, body?: T) => void | -- | - |
\| onAbort | 上传终断（abort）的回调函数 | (event: ProgressEvent) => void | -- | - |
\| onSuccess | 上传成功的回调函数 | (body: T, xhr: XMLHttpRequest) => void | -- | - |

request.upload 返回的不是一个 promise，是一个包含 abort 的对象，需要在回调参数中指定成功或失败的处理

```javascript
const request = require('@yuntijs/request')
const formData = new FormData()
formData.append('file', new Blob('foo'))
formData.append('file', new Blob('bar'))
const upload = request.upload('/upload', {
  formData,
  onProgress: e => console.log(`已上传 ${e.percent}%`)
  onError: e => console.error('', e),
  onAbort: e => console.warn('上传被终断', e),
  onSuccess: (body, xhr) => console.log('上传成功', body, xhr)
})

// 手动终断，取消文件上传
upload.abort()
```

### 更新拓展实例默认参数

实例化一个请求实例后，有时还需要动态更新默认参数，@yuntijs/request 提供 **extendOptions** 方法供用户进行更新：

```javascript
const request = extend({ timeout: 1000, params: { a: '1' } });
// 默认参数是 { timeout: 1000, params: { a: '1' }}

request.extendOptions({ timeout: 3000, params: { b: '2' } });
// 此时默认参数是 { timeout: 3000, params: { a: '1', b: '2' }}
```

## 响应结构

某个请求的响应返回的响应对象 Response 如下：

```javascript
{
  // `data` 由服务器提供的响应, 需要进行解析才能获取
  data: {},

  // `status` 来自服务器响应的 HTTP 状态码
  status: 200,

  // `statusText` 来自服务器响应的 HTTP 状态信息
  statusText: 'OK',

  // `headers` 服务器响应的头
  headers: {},
}
```

当 options.getResponse === false 时，响应结构为解析后的 data

```javascript
request.get('/api/v1/xxx', { getResponse: false }).then(function (data) {
  console.log(data);
});
```

当 options.getResponse === true 时，响应结构为包含 data 和 Response 的对象

```javascript
request.get('/api/v1/xxx', { getResponse: true }).then(function ({ data, response }) {
  console.log(data);
  console.log(response.status);
  console.log(response.statusText);
  console.log(response.headers);
});
```

在使用 catch 或者 errorHandler, 响应对象可以通过 `error` 对象获取使用，参考**错误处理**这一节文档。

## 错误处理

```javascript
import request, { extend } from '@yuntijs/request';

const errorHandler = function (error) {
  const codeMap = {
    '021': '发生错误啦',
    '022': '发生大大大大错误啦',
    // ....
  };
  if (error.response) {
    // 请求已发送但服务端返回状态码非 2xx 的响应
    console.log(error.response.status);
    console.log(error.response.headers);
    console.log(error.data);
    console.log(error.request);
    console.log(codeMap[error.data.status]);
  } else {
    // 请求初始化时出错或者没有响应返回的异常
    console.log(error.message);
  }

  throw error; // 如果throw. 错误将继续抛出.

  // 如果return, 则将值作为返回. 'return;' 相当于return undefined, 在处理结果时判断response是否有值即可.
  // return {some: 'data'};
};

// 1. 作为统一错误处理
const extendRequest = extend({ errorHandler });

// 2. 单独特殊处理, 如果配置了统一处理, 但某个api需要特殊处理. 则在请求时, 将errorHandler作为参数传入.
request('/api/v1/xxx', { errorHandler });

// 3. 通过 Promise.catch 做错误处理
request('/api/v1/xxx')
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    return errorHandler(error);
  });
```

## 中止请求

### 通过 AbortController 来中止请求

基于 [AbortController](https://developer.mozilla.org/zh-CN/docs/Web/API/FetchController) 方案来中止一个或多个 DOM 请求

**需要特别注意的是每次发送请求都需要生成新的 AbortController，如果用的同一个可能会导致后续请求无法发送**

```javascript
import Request, { AbortController } from '@yuntijs/request';

const controller = new AbortController(); // 创建一个控制器
const { signal } = controller; // 返回一个 AbortSignal 对象实例，它可以用来 with/abort 一个 DOM 请求。

signal.addEventListener('abort', () => {
  console.log('aborted!');
});

Request('/api/response_after_1_sec', {
  signal, // 这将信号和控制器与获取请求相关联然后允许我们通过调用 AbortController.abort() 中止请求
});

// 取消请求
setTimeout(() => {
  controller.abort(); // 中止一个尚未完成的DOM请求。这能够中止 fetch 请求，任何响应Body的消费者和流。
}, 100);
```

## 案例

### 如何获取响应头信息

通过 **Headers.get()** 获取响应头信息。(可参考 [MDN 文档](https://developer.mozilla.org/zh-CN/docs/Web/API/Headers/get))

```javascript
request('/api/v1/some/api', { getResponse: true }).then(({ data, response }) => {
  response.headers.get('Content-Type');
});
```

如果希望获取自定义头部信息，需要在服务器设置 [Access-Control-Expose-Headers](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Access-Control-Expose-Headers), 然后可按照上述方式获取自定义头部信息。

### 文件上传

使用 FormData () 构造函数时，浏览器会自动识别并添加请求头 `"Content-Type: multipart/form-data"`, 且参数依旧是表单提交时那种键值对，因此不需要开发者手动设置 **Content-Type**

```javascript
const formData = new FormData();
formData.append('file', file);
request('/api/v1/some/api', { method: 'post', data: formData });
// 如果需要获取上传进度，可以使用 request.upload
request.upload('/api/v1/some/api', {
  formData,
  onProgress: e => console.log(`已上传 ${e.percent}%`)
  onError: e => console.error('', e),
  onAbort: e => console.warn('上传被终断', e),
  onSuccess: (body, xhr) => console.log('上传成功', body, xhr)
});
```

### 文件下载

下载文件时经常会遇到后端提供的接口是 post 类型的请求，且需要在 headers 中传递认证信息，使用 request.download 可以很方便的实现：

```javascript
const request = require('@yuntijs/request');
const token = 'xxx';
request.download('/export', {
  method: 'POST',
  params: {
    type: 'excel',
  },
  download: {
    fileName: 'logo',
  },
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

## 开发和调试

- yarn
- yarn dev

## 🤝 Contributing

Contributions of all types are more than welcome, if you are interested in contributing code, feel free to check out our GitHub [Issues][github-issues-link] to get stuck in to show us what you’re made of.

[![][pr-welcome-shield]][pr-welcome-link]

[![][github-contrib-shield]][github-contrib-link]

<div align="right">

[![][back-to-top]](#readme-top)

</div>

---

<!-- LINK GROUP -->

[back-to-top]: https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square
[github-contrib-link]: https://github.com/yuntijs/yunti-request/graphs/contributors
[github-contrib-shield]: https://contrib.rocks/image?repo=yuntijs%2Fyunti-request
[github-issues-link]: https://github.com/yuntijs/yunti-request/issues
[pr-welcome-link]: https://github.com/yuntijs/yunti-request/pulls
[pr-welcome-shield]: https://img.shields.io/badge/☁️_pr_welcome-%E2%86%92-ffcb47?labelColor=black&style=for-the-badge
