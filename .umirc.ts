import { defineConfig } from 'dumi';

import theme from './theme.json';

const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  title: '网络请求库 request',
  favicon: 'https://avatars.githubusercontent.com/u/148947838?s=64&v=4',
  logo: 'https://avatars.githubusercontent.com/u/148947838',
  base: isProduction ? '/yunti-request/' : '/',
  publicPath: '/yunti-request/',
  outputPath: './dist/yunti-request/',
  mode: 'doc',
  theme,
  navs: [
    null,
    {
      title: 'Github',
      path: 'https://github.com/yuntijs/yunti-request',
    },
  ],
  // chainWebpack(memo) {
  //   console.log('webpack config: \n', memo.toString())
  // },
  // more config: https://d.umijs.org/config
});
