# smart-agri-miniapp

## API 环境配置

复制 `config/api.env.example.js` 为 `config/api.env.js`，并在打包前配置不同运行环境的 API 域名。

- `develop` 对应微信小程序开发版，可使用 `http://127.0.0.1:8000` 进行本地调试。
- `trial` 对应体验版，必须使用已在微信公众平台配置的 HTTPS request 合法域名。
- `release` 对应正式版，必须使用生产 HTTPS 域名；校验脚本会拦截 `localhost`、`127.0.0.1`、`example.com`、体验版和测试类域名。
- `REQUEST_TIMEOUT_MS` 控制 `wx.request` 超时时间，`REQUEST_RETRY_COUNT` 控制网络错误和 5xx 响应的自动重试次数。

打包前执行配置校验：

```powershell
node scripts\validate-api-config.cjs develop
node scripts\validate-api-config.cjs trial
$env:MINIAPP_API_BASE_URL='https://api.smart-agri.cn'; node scripts\validate-api-config.cjs release; Remove-Item Env:\MINIAPP_API_BASE_URL
```

如果未配置生产域名，`release` 校验会失败并输出明确的缺失域名错误。

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
