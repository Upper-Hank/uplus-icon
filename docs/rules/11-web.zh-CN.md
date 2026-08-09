---
slug: web
order: 11
group: usage
title: Web 使用
description: 静态单图标 DOM 工厂与无障碍
locale: zh-CN
---

## 安装

```bash
npm install @uplus-icon/web
```

## 逐图标 DOM 工厂

```ts
import { CheckIcon } from '@uplus-icon/web'

const icon = CheckIcon({
  size: 24,
  weight: 1.5,
  ariaLabel: '完成',
})

document.body.append(icon)
```

工厂返回真实 `SVGSVGElement`，适合原生页面和不使用 React 的应用。

- **必须**让固定名称使用具体图标工厂。
- **可以**通过 `attributes` 传入额外标准 SVG 属性。
- **禁止**让 v1 公开入口包含完整图标注册表或注册全局元素。

首个公开版本仅开放具体的单图标工厂。

## 工厂选项

跨框架默认值见[公共 API](/docs/api)。

DOM options 与 `attributes` 是共享公共能力在原生 Web 中的惯用表达，不构成 Web 专属图标能力。对应行为必须能由 React props 与标准 SVG 属性等价表达。

| 选项 | 类型 | 说明 |
| --- | --- | --- |
| `size` | `number \| string` | 同时设置宽高 |
| `weight` | `number` | 按比例调整图标重量，限制在 `0.5–2` |
| `absoluteWeight` | `boolean` | 数值尺寸下保持 CSS 像素重量；字符串尺寸使用相对重量 |
| `title` | `string` | 创建 title 节点 |
| `ariaLabel` | `string` | 提供无障碍名称 |
| `className` | `string` | 设置 SVG class |
| `attributes` | `Record` | 添加标准 SVG 属性 |

## 无障碍

- **必须**让无标题和无标签的图标默认 `aria-hidden="true"`。
- **必须**让有 `title` 或 `ariaLabel` 的 SVG 使用 `role="img"`。
