---
slug: accessibility
order: 14
group: usage
title: 可访问性
description: 装饰图标、语义图标与按钮命名
locale: zh-CN
---

## 默认语义

Raw SVG 不固定写入 `title`、`role` 或 ARIA。框架层根据场景决定：没有名称的图标默认装饰性隐藏；独立传达信息时必须获得可访问名称。

- **必须**让装饰图标输出 `aria-hidden="true"`。
- **必须**让有 `title` 或 `aria-label` 的图标使用 `role="img"`。
- **禁止**直接把文件名作为面向用户的可访问名称。

## 交互控件

Icon-only Button 的名称由按钮提供，例如“关闭对话框”，不是“close 图标”。相邻文本已经表达含义时，图标保持隐藏，避免重复朗读。

## 状态与颜色

不得只靠颜色区分状态。加载、错误、成功等状态需要文本、可访问名称或控件状态同步表达。
