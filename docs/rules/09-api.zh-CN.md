---
slug: api
order: 9
group: usage
title: 静态公共 API
description: 尺寸、重量、颜色与跨框架一致性
locale: zh-CN
---

## v1 API

```ts
type IconProps = {
  size?: number | string
  weight?: number
  absoluteWeight?: boolean
}
```

`size` 默认 `24`，只改变最终宽高。

## 跨框架能力一致

所有面向用户的框架包遵循“能力一致、写法不同”。React 与 Web 必须提供同一组公共能力：静态图标、尺寸、颜色、重量、无障碍，以及各自平台的原生扩展入口。

- **必须**让同一输入语义在 React 与 Web 中产生等价的 SVG 行为和无障碍结果。
- **必须**把差异限制在平台惯用表达：React 使用组件 props、标准 SVG props 与 `ref`；Web 使用 DOM factory options、`attributes` 并返回真实 `SVGSVGElement`。
- **禁止**仅在一个面向用户的框架包中增加公共图标能力；能力变化必须同时评估 React 与 Web。
- **禁止**把私有设计真源、导入脚本或生成工具作为用户 API 暴露。
- **必须**在未来发布动态入口时，让 React 与 Web 的动态能力继续对齐，并使用显式、独立的入口，不能让静态入口隐式携带完整注册表。

## 重量

`weight` 默认值为 `2`，描边缩放规则为 `strokeScale = weight ÷ 2`。所有真源描边宽度乘以同一个 `strokeScale`，以保留图标内部比例，且普通 `path`、`line` 等描边节点的路径、端点和几何绝不改变。实心圆和椭圆固定中心并缩放半径；实心矩形固定中心并缩放尺寸和圆角。为避免低重量下的实心细节消失，同时保持变化连续，它们使用 `solidScale = (weight + 1) ÷ 3`：重量 `0.5`、`1`、`1.5`、`2` 分别对应 `0.5`、`2/3`、`5/6`、`1`。复杂实心 path 保持不变，必须单独经过设计复核。

仅有经过审计的实心 path 可使用同一 `solidScale`：`textarea` 提示角围绕右下角 `(19, 17)`，`headset` 圆点围绕 `(14, 19.5)`，`qr-code` 的三个模块分别围绕自身中心缩放。它们的原始 `d` 保持不变；其他实心 path 不继承此规则。

`absoluteWeight` 默认值为 `false`。当它与有限正数 `size` 同时使用时，运行时分别计算 `strokeScale = (weight ÷ 2) × (24 ÷ size)` 与 `solidScale = ((weight + 1) ÷ 3) × (24 ÷ size)`。因此描边和受支持的实心细节都保持各自连续映射下的 CSS 像素尺寸。`em`、`%`、`calc()` 等字符串尺寸无法在 SSR 中确定解析，因此安全回退为相对重量。

- **必须**让 React 与 Web 工厂具有相同行为。
- **必须**把运行时 `weight` 收敛在 `0.5–2`，非有限值回退为 `2`。
- **必须**让绝对重量同步作用于描边和受支持的实心基础几何；禁止仅靠描边 `vector-effect` 实现。
- **禁止**因 `size` 或重量参数选择、生成或修改另一份源 SVG。

## 颜色与属性

描边和少量实心细节统一继承 `currentColor`。React 接受标准 SVG 属性和 `ref`；Web 工厂接受显式属性映射。单图标导入不得带入内部图标注册表。

## 无障碍

没有 `title` 或无障碍名称时默认 `aria-hidden="true"`。有名称时使用 `role="img"`。图标按钮的操作名称由按钮提供，不用内部图形名称替代。

## 兼容性

具名组件与逐图标入口应渲染同一 definition。新增属性必须有稳定默认值；不传新属性的旧调用保持原有结果。
