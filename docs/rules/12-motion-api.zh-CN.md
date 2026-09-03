---
slug: motion-api
order: 12
group: motion
title: Motion 公共 API
description: 规则包、名称匹配、React 用法、播放控制与降级契约
locale: zh-CN
---

## 发布状态

Motion **仍在孵化，尚未发布**。`packages/motion` 是 `private` 包、版本为 `0.0.0`，并被排除在 changeset 发布计划之外；文档网站把预览放在 `motion` 发布开关之后；生成的公共元数据会剥离全部 `motion` 字段。下面的规则定义的是它首次公开发布前必须满足的契约，而不是当前可安装的包。

## 产品边界

`@uplus-icon/motion` 是可选安装的动画规则与执行器，将独立于 Core 和 React 发布。它不维护 SVG、不生成第二套动画图标，也不改变原始 SVG。静态包不依赖 Motion，因此静态消费者不承担动画代码成本。

- **必须**让静态组件、名称组件和 Motion 组件渲染同一份 Core Definition。
- **必须**让通用规则在 Motion 包内只定义一次；专属规则通过图标 `name` 匹配。
- **必须**让 metadata 只声明已实现能力，不保存关键帧、时长、缓动或选择器。
- **禁止**复制、修改或回写 `packages/icons/raw` 中的 SVG。

## React 用法

```bash
npm install @uplus-icon/react @uplus-icon/motion
```

```tsx
import { Icon } from '@uplus-icon/motion/react'

<Icon name="bell" motion="ring" trigger="hover" />
<Icon name="heart" motion="beat" trigger="click" />
<Icon name="user" motion="fade" trigger="mount" />
```

Motion 版 `Icon` 委托 `@uplus-icon/react/dynamic` 渲染图标，再用同一个 `name` 选择专属规则。`name="heart" motion="ring"` 等不支持组合必须产生 TypeScript 错误；绕过类型的运行时输入应发出可诊断警告并保持静态显示。

`trigger` 支持 `manual`、`mount`、`hover`、`click`，默认 `manual`。省略 `motion` 时只渲染静态图标。

## 动画能力

通用动画 `fade`、`scale`、`blur` 对所有图标开放，并在包内各自只存在一份规则。描边描绘动画不属于首发公共 API。

首发专属规则为 `bell:ring`、`heart:beat`、`refresh:rotate`。专属规则只能用于其声明的图标。转换动画暂不属于首发公共 API，也不承诺任意 Morph。

## 框架无关 API

```ts
import { animateIcon } from '@uplus-icon/motion'

const controls = animateIcon(svg, 'bell', 'ring', {
  direction: 'in',
  duration: 1000,
  easing: 'standard',
  loop: false,
})

controls.play()
```

控制器提供 `play`、`pause`、`reverse`、`finish`、`reset`、`cancel`、`dispose`、`seek`、`playFrom` 和 `progress`。`playFrom(progress, playback)` 可以从指定进度按任一方向开始播放。底层使用浏览器 Web Animations API，不把 GSAP 作为公共运行时依赖。

`animateIcon` 还接受 `animationTarget`，用于把动画施加到图标 `<svg>` 之外的元素上，从而在不改动图标标记的情况下驱动外层容器。React 组件提供 `onMotionReady`，在动画创建完成后回传控制器。

## 静态外观

- **必须**让尚未播放的图标与静态图标在视觉上完全一致。动画以 idle 状态创建，播放前不施加任何关键帧。
- **必须**在 `reset`、`cancel` 和 `dispose` 时恢复同一个静态外观，包括动画预置的描边表现。

## API 行为

默认 `autoplay=false`、`loop=false`、`direction='in'`、`reducedMotion='auto'`。各规则提供统一默认时长和缓动；调用方传入的时长、缓动、方向和循环设置彼此正交。循环必须显式开启，并在组件卸载或 `dispose` 时停止。

`direction='out'` 采用倒放已声明的入场关键帧，而不是反转关键帧列表，这样多步专属动画才能连贯地反向播放。

## Reduced Motion

默认读取 `prefers-reduced-motion`。启用时，非淡化动画降级为 100ms 短淡入，循环关闭；最终静态图标和语义保持不变。`reducedMotion='never'` 保留原规则，`reducedMotion='always'` 则无论系统偏好都降级。React 组件会在系统设置变化时重新评估该偏好。

## 网站一致性

文档网站的动画预览必须直接调用 `@uplus-icon/motion`，不得在站点内维护另一份关键帧、时长或能力映射。网站展示结果因此就是消费者实际得到的公共实现。在 `motion` 发布开关关闭期间，网站必须以懒加载方式引入该代码，避免未启用的功能进入发布产物。
