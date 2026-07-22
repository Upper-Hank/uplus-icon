---
slug: versioning
order: 16
group: governance
title: 版本、弃用与兼容性
description: Breaking Change、别名迁移、部件稳定性和版本记录
locale: zh-CN
---

## 兼容单位

包级 SemVer 是发布契约，单图标的 `publishedIn`、`updatedIn` 和弃用状态提供追踪信息。视觉修正也必须在变更日志中可见。

## Breaking Change

以下变化需要 Major 或明确兼容层：删除/改名公共导出、无别名改 Canonical Name、删除或改名 `data-part`、破坏 Motion 部件映射、收窄既有属性输入。

## 弃用流程

- **必须**提供原因、替代项和预计移除版本。
- **应该**至少跨过一个 Minor 周期再移除。
- **禁止**让 Alias 自动产生未声明的代码导出。

分类、标签和描述通常属于非破坏性元数据更新，但改变主分类会影响站点导航，应记录在 Changelog。安全或可访问性问题可以采用加速迁移，并明确说明影响。
