---
slug: motion-authoring
order: 13
group: motion
title: Motion 制作规范
description: data-part、时序、转换配对与运动质量审核
locale: zh-CN
---

## 语义部件

Motion 构建依赖稳定的 `data-part`，使用 kebab-case 且不使用全局 `id`。部件描述结构角色，如 `body`、`handle`、`indicator`，不得描述某一次动画实现。

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

通用能力在 metadata 中使用基础能力 ID：`fade`、`scale`、`blur`、`draw`；进入或退出方向由 Motion API 参数表达，不分别写成重复能力。专属能力使用稳定的动作 ID，如 `ring`、`beat`、`rotate`。关键帧、时长、缓动和选择器只维护在 Motion 包内。

## 转换动画

转换对必须记录起点、终点、部件映射和不兼容降级。若两端几何不能稳定插值，应改用交叉淡化或离散状态切换，不生成未经审核的兼容路径。

## 审核矩阵

至少检查正常、暂停、反向、快速重复触发、深浅主题和 Reduced Motion。最终状态必须与静态图标一致。
