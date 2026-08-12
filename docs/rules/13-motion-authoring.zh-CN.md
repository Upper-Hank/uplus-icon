---
slug: motion-authoring
order: 13
group: motion
title: Motion 制作规范
description: 整体规则、data-part、时序、能力登记与运动质量审核
locale: zh-CN
---

## 语义部件

现有首发规则全部作用于完整 SVG，不依赖 `data-part`。只有未来确实需要单独移动某个内部部件时，Motion 才依赖稳定的 `data-part`；名称使用 kebab-case 且不使用全局 `id`。部件描述结构角色，如 `body`、`handle`、`indicator`，不得描述某一次动画实现。

- **必须**保留路径顺序、层级和部件关系。
- **禁止**在非破坏性版本中随意改名、拆分或合并部件。
- **必须**让每个部件名在单个图标内唯一，避免选择器和时序产生歧义。

`data-part` 属于 Canonical SVG 的结构契约；`parts` 是 `icons.json` 中同一契约的校验清单。优先把 `data-part` 放在包住整个部件的 `g` 上；单元素部件可以直接标在 `path` 等图形元素上。每个名称在单个图标内必须唯一。

```svg
<g data-part="body">...</g>
<path data-part="indicator" d="..." />
```

整体动画不需要部件标记。只有某个部分需要独立运动、独立时序或参与经过审核的转换映射时，才增加 `data-part`。对已批准 SVG 增加、删除或调整标记仍属于 raw 变更，必须获得该文件的明确授权。

## 时序与变换

优先使用 transform 和 opacity，避免持续改写复杂 path。旋转中心、运动方向和回弹必须服务于物体结构。循环动画需要明确停止条件，不允许后台无限消耗资源。

通用能力 `fade`、`scale`、`blur` 是全局规则，不按图标复制实现。进入或退出方向由 Motion API 参数表达。专属能力使用稳定动作 ID，并在 metadata 与 Motion 规则映射中同时登记，如 `bell:ring`、`heart:beat`、`refresh:rotate`。关键帧、时长、缓动和选择器只维护在 Motion 包内。

新增专属规则时必须同时完成：实现规则、登记 metadata 能力、补充类型映射、更新中英文规则文档、接入网站选择器并完成测试。任何一步缺失都不视为可发布能力。

## 转换动画

转换对必须记录起点、终点、部件映射和不兼容降级。若两端几何不能稳定插值，应改用交叉淡化或离散状态切换，不生成未经审核的兼容路径。

## 审核矩阵

至少检查正常、暂停、反向、快速重复触发、循环停止、卸载清理、深浅主题和 Reduced Motion。最终状态必须与静态图标一致，并验证网站预览使用公共 Motion 包而非站点私有实现。
