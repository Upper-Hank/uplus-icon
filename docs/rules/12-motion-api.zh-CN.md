---
slug: motion-api
order: 12
group: motion
title: Motion 公共 API
description: 规则包、名称匹配、React 用法、播放控制与降级契约
locale: zh-CN
---

## 产品边界

`@uplus-icon/motion` 是独立发布、可选安装的动画规则与执行器。它不维护 SVG、不生成第二套动画图标，也不改变原始 SVG。静态包不依赖 Motion，因此静态消费者不承担动画代码成本。

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

控制器提供 `play`、`pause`、`reverse`、`finish`、`reset`、`cancel`、`dispose`、`seek` 和 `progress`。底层使用浏览器 Web Animations API，不把 GSAP 作为公共运行时依赖。

## API 行为

默认 `autoplay=false`、`loop=false`、`direction='in'`、`reducedMotion='auto'`。各规则提供统一默认时长和缓动；调用方传入的时长、缓动、方向和循环设置彼此正交。循环必须显式开启，并在组件卸载或 `dispose` 时停止。

## Reduced Motion

默认读取 `prefers-reduced-motion`。启用时，非淡化动画降级为 100ms 短淡入，循环关闭；最终静态图标和语义保持不变。只有明确传入 `reducedMotion='never'` 才能覆盖系统偏好。

## 网站一致性

文档网站的动画预览必须直接调用 `@uplus-icon/motion`，不得在站点内维护另一份关键帧、时长或能力映射。网站展示结果因此就是消费者实际得到的公共实现。
