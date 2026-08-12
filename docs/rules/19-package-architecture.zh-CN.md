---
slug: package-architecture
order: 19
group: architecture
title: 包与生成架构
description: Source、Core、React 和站点的职责边界
locale: zh-CN
---

## 分层

```text
approved raw SVG + metadata
          ↓ read-only generation
core definitions ──→ React ──→ site
```

`@uplus-icon/source` 私有维护资产和生成器；`core` 提供无框架 definition、名称注册表、类型和元数据；`react` 提供静态与显式名称组件；站点只消费公共输出。

## 公共和私有边界

- **必须**让 React 使用共享 Core Definition 实现静态图标、尺寸、颜色、重量和无障碍。
- **禁止**让 `@uplus-icon/source`、设计真源、元数据维护入口和生成工具成为消费者依赖的公共接口。
- **必须**让 React 名称 API 只通过显式 `dynamic` 入口开放；静态入口继续保持无完整注册表依赖。

## 入口设计

- **必须**保留逐图标入口用于真正按需加载。
- **必须**让完整图标注册表只出现在显式 `dynamic` 入口，不得进入静态入口或逐图标入口。
- **禁止**手工编辑 `src/generated` 或 `dist`。
- **应该**让公开包入口保持 `sideEffects: false`。

## 依赖方向

Core 不依赖框架；React 只依赖 Core；站点依赖公开包。生成器只读 Raw SVG 和 metadata 并单向写入生成目录，任何反向写入均为架构违规。
