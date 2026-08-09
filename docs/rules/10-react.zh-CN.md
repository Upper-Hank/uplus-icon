---
slug: react
order: 10
group: usage
title: React 使用
description: 具名组件、单图标导入、重量、类型和无障碍
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
<CheckIcon color="currentColor" weight={1.5} />
```

- **必须**让固定图标使用具名组件或逐图标路径。
- **应该**把颜色交给父级 CSS `color` 控制。
- **禁止**让静态图标导入包含完整图标注册表。

## 单图标导入

```tsx
import CheckIcon from '@uplus-icon/react/icons/check'

<CheckIcon size={24} />
```

首个公开版本仅开放静态具名组件和单图标路径。

## 公共属性

跨框架默认值见[公共 API](/docs/api)。v1 使用单一 `24×24` 母版，不提供 `opticalSize`。

React 的 props 是共享公共能力在 React 中的惯用表达，不构成 React 专属能力。对应行为必须能由 Web factory options 或 `attributes` 等价表达。

| 属性 | 类型 | 默认值 | 行为 |
| --- | --- | --- | --- |
| `size` | `number \| string` | `24` | 同时设置宽度和高度 |
| `weight` | `number` | `2` | 按比例调整图标重量，限制在 `0.5–2` |
| `absoluteWeight` | `boolean` | `false` | 数值尺寸下保持 CSS 像素重量；字符串尺寸使用相对重量 |
| `color` | `string` | 继承 | 通过 currentColor 控制视觉颜色 |
| `title` | `string` | — | 添加 SVG title 并暴露图像语义 |
| `ref` | `SVGSVGElement` | — | 转发到底层 SVG |

重量会保留真源描边比例，并让受支持的实心基础图形围绕自身中心按 `(weight + 1) ÷ 3` 连续缩放。复杂填充 path 不会被自动变形。未传入 `weight` 时按重量 `2` 渲染正式母版。绝对重量会按数值尺寸分别调整描边与受支持的实心几何。

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
