---
slug: api
order: 9
group: usage
title: 公共 API
description: 静态与名称渲染、尺寸、重量、颜色和无障碍
locale: zh-CN
---

## 渲染路径

固定 UI 使用具名组件，数据驱动名称使用显式 `dynamic` 入口。两条路径解析同一份生成后的 Core Definition；静态根入口和逐图标入口不会导入完整注册表。

```tsx
import { CheckIcon } from '@uplus-icon/react'
import { Icon } from '@uplus-icon/react/dynamic'

<CheckIcon />
<Icon name="check" />
```

## 基础 API

```ts
type IconProps = {
  size?: number | string
  weight?: number
  absoluteWeight?: boolean
}
```

`size` 默认 `24`，只改变最终宽高。

## React 公共行为

React 包提供静态图标、尺寸、颜色、重量、无障碍、标准 SVG 属性和 ref。

- **必须**使用组件 props、标准 SVG props 与 `ref` 作为公共运行时接口。
- **禁止**把私有设计真源、导入脚本或生成工具作为用户 API 暴露。
- **必须**让名称渲染只通过显式 `dynamic` 入口开放，不能让静态入口隐式携带完整注册表。

## 重量

`weight` 默认值为 `2`，描边缩放规则为 `strokeScale = weight ÷ 2`。所有真源描边宽度乘以同一个 `strokeScale`，以保留图标内部比例，且普通 `path`、`line` 等描边节点的路径、端点和几何绝不改变。实心圆和椭圆固定中心并缩放半径；实心矩形固定中心并缩放尺寸和圆角。为避免低重量下的实心细节消失，同时保持变化连续，它们使用 `solidScale = (weight + 1) ÷ 3`：重量 `0.5`、`1`、`1.5`、`2` 分别对应 `0.5`、`2/3`、`5/6`、`1`。复杂实心 path 保持不变，必须单独经过设计复核。

仅有经过审计的实心 path 可使用同一 `solidScale`：`textarea` 提示角围绕右下角 `(19, 17)`，`headset` 圆点围绕 `(14, 19.5)`，`qr-code` 的三个模块分别围绕自身中心缩放。它们的原始 `d` 保持不变；其他实心 path 不继承此规则。

`absoluteWeight` 默认值为 `false`。当它与有限正数 `size` 同时使用时，`weight` 表示 CSS 像素，范围为 `0.5–8`；运行时分别计算 `strokeScale = (weight ÷ 2) × (24 ÷ size)` 与 `solidScale = ((weight + 1) ÷ 3) × (24 ÷ size)`。因此描边和受支持的实心细节都保持各自连续映射下的 CSS 像素尺寸。`em`、`%`、`calc()` 等字符串尺寸无法在 SSR 中确定解析，因此安全回退为 `0.5–2` 的相对重量。

- **必须**把相对 `weight` 收敛在 `0.5–2`，把可确定数值尺寸下的绝对 `weight` 收敛在 `0.5–8`；非有限值回退为 `2`。
- **必须**让绝对重量同步作用于描边和受支持的实心基础几何；禁止仅靠描边 `vector-effect` 实现。
- **禁止**因 `size` 或重量参数选择、生成或修改另一份源 SVG。

## 颜色与属性

描边和少量实心细节统一继承 `currentColor`。React 接受标准 SVG 属性和 `ref`。单图标导入不得带入内部图标注册表。

## 无障碍

没有 `title` 或无障碍名称时默认 `aria-hidden="true"`。有名称时使用 `role="img"`。图标按钮的操作名称由按钮提供，不用内部图形名称替代。

## 兼容性

具名组件与逐图标入口应渲染同一 definition。新增属性必须有稳定默认值；不传新属性的旧调用保持原有结果。
