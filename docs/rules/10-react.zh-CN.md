---
slug: react
order: 10
group: usage
title: React 使用
description: 具名组件、动态渲染、线宽、类型和无障碍
locale: zh-CN
---

## 安装

```bash
npm install @uplus-icon/react
```

## 具名组件

名称固定时优先使用具名组件，以获得自动补全、类型检查和 Tree Shaking。

```tsx
import { CheckIcon } from '@uplus-icon/react'

<CheckIcon size={24} />
<CheckIcon color="currentColor" strokeWidth={1.5} />
```

- **必须**让固定图标使用具名组件或逐图标路径。
- **应该**把颜色交给父级 CSS `color` 控制。
- **禁止**为了一个固定图标导入完整动态注册表。

## 动态名称

```tsx
import { Icon, type IconName } from '@uplus-icon/react/dynamic'

const name: IconName = 'check'
<Icon name={name} size={24} />
```

动态入口适合名称来自配置、接口或用户数据的场景，它会包含完整图标定义注册表。

## 公共属性

跨框架默认值见[公共 API](/docs/api)。v1 使用单一 `24×24` 母版，不提供 `opticalSize`。

| 属性 | 类型 | 默认值 | 行为 |
| --- | --- | --- | --- |
| `size` | `number \| string` | `24` | 同时设置宽度和高度 |
| `strokeWidth` | `number` | SVG 真源 | 限制在 `0.5–2` |
| `absoluteStrokeWidth` | `boolean` | `false` | 保持 CSS 像素线宽，不随 size 缩放 |
| `color` | `string` | 继承 | 通过 currentColor 控制视觉颜色 |
| `title` | `string` | — | 添加 SVG title 并暴露图像语义 |
| `ref` | `SVGSVGElement` | — | 转发到底层 SVG |

纯填充图标不会因 `strokeWidth` 改变。未传入线宽时，组件保留真源默认值；绝对线宽通过 `non-scaling-stroke` 实现。

## 无障碍

- **必须**让纯装饰图标保持无语义；组件默认设置 `aria-hidden="true"`。
- **必须**在图标独立承担含义时提供 `aria-label` 或 `title`。
- **应该**在按钮已有可见文字时避免重复标签。

```tsx
<CheckIcon aria-label="完成" />

<button type="button">
  <CheckIcon />
  完成
</button>
```

## 服务端渲染

组件不读取浏览器尺寸或 DOM 状态，可以安全用于服务端渲染。图形 body 来自构建生成，不在客户端重新解析或优化。
