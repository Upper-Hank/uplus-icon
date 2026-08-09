---
slug: release-process
order: 20
group: governance
title: 发布流程
description: 冻结、生成、验证、Changeset、发布和回滚
locale: zh-CN
---

## 发布准备

确认资产批准状态、元数据完整性、公共 API 变化和文档版本。Working Draft 可以随站点发布，但不能把待定能力描述为已上线。

## 发布顺序

1. 冻结本次 Raw SVG 与元数据范围。
2. 运行生成并确认 Raw SVG diff 为空。
3. 运行类型检查、包构建、站点构建、消费者、保真和包体测试。
4. 审核 Changeset、Changelog 和弃用说明。
5. 按 Core → React/Web → Site 的依赖顺序发布。

- **必须**为失败门禁停止发布。
- **禁止**为了通过门禁自动修复或覆盖 SVG。
- **必须**保留可复现的版本、命令和产物摘要。

## 回滚

优先发布修复版本或撤回站点展示；不得用历史 SVG 覆盖当前真源来临时回滚。涉及名称或部件契约时，按兼容策略恢复别名或适配层。
