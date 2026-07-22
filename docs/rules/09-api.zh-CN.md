---
slug: api
order: 9
group: usage
title: 静态公共 API
description: 单母版尺寸、线宽、绝对线宽、颜色与跨框架一致性
locale: zh-CN
---

## v1 API

```ts
type IconProps = {
  size?: number | string
  strokeWidth?: number
  absoluteStrokeWidth?: boolean
}
```

`size` 默认 `24`，只改变最终宽高。v1 不提供 Optical Size，也不根据尺寸选择另一份图形真源。

## 线宽模式

默认 `strokeWidth=2` 来自 Canonical SVG，并随 24px 母版一起缩放：`最终线宽 = strokeWidth × size ÷ 24`。传入 `absoluteStrokeWidth` 后，浏览器使用 `non-scaling-stroke`，最终线宽保持为 CSS 像素。

- **必须**让 React、Web 工厂和 Web Component 具有相同行为。
- **必须**把运行时 `strokeWidth` 收敛在 `0.5–2`，非有限值回退为 `2`。
- **禁止**因 `size` 或线宽参数选择、生成或修改另一份 SVG。

## 颜色与属性

描边和少量实心细节统一继承 `currentColor`。React 接受标准 SVG 属性和 `ref`；Web 工厂接受显式属性映射。公共入口不得把整个动态图标表带入单图标导入。

## 无障碍

没有 `title` 或无障碍名称时默认 `aria-hidden="true"`。有名称时使用 `role="img"`。图标按钮的操作名称由按钮提供，不用内部图形名称替代。

## 兼容性

具名组件、`Icon(name)`、逐图标入口与 Web Component 应渲染同一 definition。新增属性必须有稳定默认值；不传新属性的旧调用保持原有结果。
