# 点选文字验证码

200+ 中文词汇支持。每个词汇不含重复字，随机插入迷惑文字，提示图片防止机器识别。

## 示例

```javascript
import { ClickCaptcha } from 'captcha-pro'

const captcha = new ClickCaptcha({
  el: '#click-captcha',
  width: 300,
  height: 170,
  count: 3,
  onSuccess: () => console.log('验证通过!')
})

const points = captcha.getClickPoints()
```

## 选项

| 参数 | 类型 | 默认值 | 描述 |
|------|------|---------|------|
| `el` | `string \| HTMLElement` | - | 容器元素或选择器 |
| `width` | `number` | `300` | 容器宽度 |
| `height` | `number` | `170` | 容器高度 |
| `count` | `number` | `3` | 点击点数量 |
| `showRefresh` | `boolean` | `true` | 显示刷新按钮 |
| `className` | `string` | `'captcha-click'` | 自定义类名 |
| `verifyMode` | `'frontend' \| 'backend'` | `'frontend'` | 验证模式 |
| `backendVerify` | `BackendVerifyOptions` | - | 后端验证配置 |
| `security` | `SecurityOptions` | - | 安全选项 |
| `onSuccess` | `() => void` | - | 验证成功回调 |
| `onFail` | `() => void` | - | 验证失败回调 |
| `onRefresh` | `() => void` | - | 刷新回调 |

`BackendVerifyOptions` 与 `SecurityOptions` 详见 [API 选项](/zh/api/options)。

## 实例方法

| 方法 | 描述 |
|------|------|
| `verify(data)` | 手动验证 |
| `reset()` | 重置验证码状态 |
| `refresh()` | 生成新的验证码 |
| `destroy()` | 销毁验证码实例 |
| `getClickPoints()` | 获取已点击的点位 |
| `getSignedData()` | 获取带签名的数据用于后端验证 |
| `getStatistics()` | 获取验证统计 |
| `resetStatistics()` | 重置统计数据 |
