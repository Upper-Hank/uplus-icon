---
slug: motion-api
order: 12
group: motion
title: Motion 公共 API
description: 独立包、能力声明、动画分层与降级契约
locale: zh-CN
---

## 产品边界

Motion 是独立发布、可选安装的产品层。静态包不依赖 Motion 运行时，也不保证已渲染的静态 SVG 能被事后增强。

- **必须**与静态包共用 Canonical SVG 几何真源。
- **必须**把动画实现集中维护，元数据只声明能力。
- **禁止**让静态消费者承担 Motion 代码或元数据成本。

## 动画能力

通用呈现动画包括 `draw-in/out`、`fade-in/out`、`blur-in/out`、`scale-in/out`。专属动画只向适合的图标开放，例如 `bell:ring`、`heart:beat`、`refresh:rotate`。转换动画只支持经过设计验证的图标对，不承诺任意 Morph。

## API 行为

未知或不支持的动画名称必须产生可诊断结果，不得静默替换为不同语义。动画时长、缓动、重复和播放控制保持正交；默认值由 Motion 包版本统一定义。

## Reduced Motion

Motion API 必须尊重 `prefers-reduced-motion`。呈现动画优先降级为无位移的即时或短淡入；装饰性循环动画停止；表达状态变化的动画保留最终状态，不丢失语义。
