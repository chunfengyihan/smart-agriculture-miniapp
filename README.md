# smart-agri-miniapp

原生微信小程序项目，用于承载智慧农业移动端看板。

## 本地打开

1. 使用微信开发者工具打开本文件夹。
2. 初次开发可使用游客 AppID。
3. 默认 API 地址在 `config/api.js`，当前为 `http://127.0.0.1:8000`。

## 首版范围

- 作物总览
- 大棚列表
- 大棚指标详情
- 趋势与预警
- 微信登录入口预留

## 上线前必须调整

- 将 `project.config.json` 的 `appid` 替换为真实小程序 AppID。
- 将 `config/api.js` 的生产 API 域名改为 HTTPS 域名。
- 在微信公众平台配置 request 合法域名。
- 后端补齐微信登录接口和 token 鉴权。
