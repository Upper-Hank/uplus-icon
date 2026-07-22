---
slug: package-architecture
order: 19
group: architecture
title: 包与生成架构
description: Source、Core、React、Web、Motion 和站点的职责边界
locale: zh-CN
---

## 分层

```text
approved raw SVG + metadata
          ↓ read-only generation
core definitions ──→ React ──→ site
       └───────────→ Web
       └───────────→ Motion (future package)
```

`@uplus-icon/source` 私有维护资产和生成器；`core` 提供无框架 definition、类型和元数据；`react` 提供组件；`web` 提供 DOM 工厂与 Web Component；Motion 独立发布；站点只消费公共输出。

## 入口设计

- **必须**保留逐图标入口用于真正按需加载。
- **必须**把动态名称渲染放在显式 `dynamic` 入口。
- **禁止**手工编辑 `src/generated` 或 `dist`。
- **应该**保持 `sideEffects: false`，只有自动注册的 Web Component 入口声明副作用。

## 依赖方向

Core 不依赖框架；React/Web 只依赖 Core；站点可以依赖公开包。生成器只读 Raw SVG 和元数据并单向写入生成目录，任何反向写入均为架构违规。
