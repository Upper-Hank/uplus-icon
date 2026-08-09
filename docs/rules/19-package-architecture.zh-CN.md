---
slug: package-architecture
order: 19
group: architecture
title: 包与生成架构
description: Source、Core、React、Web 和站点的职责边界
locale: zh-CN
---

## 分层

```text
approved raw SVG + metadata
          ↓ read-only generation
core definitions ──→ React ──→ site
       └───────────→ Web
```

`@uplus-icon/source` 私有维护资产和生成器；`core` 提供无框架 definition、类型和元数据；`react` 提供静态组件；`web` 提供单图标 DOM 工厂；站点只消费公共输出。

## 公共和私有边界

- **必须**让 React 与 Web 共享同一 Core Definition，并保持静态图标、尺寸、颜色、重量、无障碍和平台原生扩展能力一致。
- **必须**只让表达形式适配平台：React 暴露组件 props；Web 暴露 DOM options 与 `attributes`。
- **禁止**让 `@uplus-icon/source`、设计真源、元数据维护入口和生成工具成为消费者依赖的公共接口。
- **必须**把未来的动态 React/Web API 设计成能力对齐的显式独立入口；静态入口继续保持无完整注册表依赖。

## 入口设计

- **必须**保留逐图标入口用于真正按需加载。
- **必须**让完整图标注册表不出现在首版公开包导出中。
- **禁止**手工编辑 `src/generated` 或 `dist`。
- **应该**让公开包入口保持 `sideEffects: false`。

## 依赖方向

Core 不依赖框架；React/Web 只依赖 Core；站点可以依赖公开包。生成器只读 Raw SVG 和元数据并单向写入生成目录，任何反向写入均为架构违规。
