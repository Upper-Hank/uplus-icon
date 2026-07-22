---
slug: web
order: 11
group: usage
title: Web 使用
description: 原生 DOM 工厂、动态名称和自定义元素
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
  strokeWidth: 1.5,
  ariaLabel: '完成',
})

document.body.append(icon)
```

工厂返回真实 `SVGSVGElement`，适合原生页面和不使用 React 的应用。

- **必须**让固定名称使用具体图标工厂。
- **可以**通过 `attributes` 传入额外标准 SVG 属性。
- **禁止**让普通逐图标入口注册全局自定义元素。

## 动态名称

名称来自配置或数据时，可以使用动态 `Icon`。它会携带完整注册表，应明确接受对应包体成本。

## Web Component

```html
<script type="module">
  import '@uplus-icon/web/element'
</script>

<uplus-icon
  name="check"
  size="24"
  stroke-width="1.5"
  aria-label="完成"
></uplus-icon>
```

- **必须**只通过 `@uplus-icon/web/element` 注册默认自定义元素。
- **可以**调用 `registerIconElement()` 注册自定义标签名。
- **必须**在 `name`、`size`、`stroke-width`、`absolute-stroke-width`、`title` 或 `aria-label` 改变时重新渲染。

## 工厂选项

跨框架默认值见[公共 API](/docs/api)。v1 使用单一 `24×24` 母版，不提供 Optical Size。

| 选项 | 类型 | 说明 |
| --- | --- | --- |
| `size` | `number \| string` | 同时设置宽高 |
| `strokeWidth` | `number` | 限制在 `0.5–2` |
| `absoluteStrokeWidth` | `boolean` | 保持 CSS 像素线宽 |
| `title` | `string` | 创建 title 节点 |
| `ariaLabel` | `string` | 提供无障碍名称 |
| `className` | `string` | 设置 SVG class |
| `attributes` | `Record` | 添加标准 SVG 属性 |

## 无障碍与副作用

- **必须**让无标题和无标签的图标默认 `aria-hidden="true"`。
- **必须**让有 `title` 或 `ariaLabel` 的 SVG 使用 `role="img"`。
- **应该**只在确实使用 Web Component 时导入 element 副作用入口。
