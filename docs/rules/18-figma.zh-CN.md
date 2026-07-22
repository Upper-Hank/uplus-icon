---
slug: figma
order: 18
group: architecture
title: Figma 资产协作
description: 设计工作源、Canonical SVG 优先级、同步和冲突处理
locale: zh-CN
---

## 角色划分

Figma 用于设计、编辑、评审、组件展示和设计侧分发；规范化 Canonical SVG 是发布的唯一权威真源。两者不一致时停止同步并以已批准 SVG 为准。

- **必须**让 Figma 组件记录 Canonical Name 和版本状态。
- **必须**在仓库外清理背景、网格、参考框和辅助线。
- **禁止**让自动同步直接覆盖 `packages/icons/raw`。

## 交接清单

交接需要 24×24 画布、透明背景、currentColor/none、部件命名、目标尺寸截图和负责人批准记录。Motion 候选还需说明部件层级和转换关系。

## 冲突处理

发现几何、顺序或名称冲突时暂停导入，记录双方版本和差异，由负责人选择替换、修订设计稿或保留现状。工具不得自行合并路径或猜测正确版本。
