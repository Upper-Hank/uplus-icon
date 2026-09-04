# 更新日志

## [0.1.0-beta.3] - 2026-09-04

### 新增

- 五个图标：`paste`、`marquee`、`screenshot`、`leaf`、`exit`。
- `clock` 增加检索别名 `history`。

### 变更

- 目录现为 316 个图标。

## [0.1.0-beta.2] - 2026-09-04

### 新增

- 七个图标：`clipboard`、`folder-plus`、`inbox`、`pet`、`trophy`、`basketball`、`setting-alt`。
- `badge` 公共名称与 `BadgeIcon` 导出改为 `medal`，并保留弃用兼容。

### 变更

- 按批准真源更新 `file`、`folder`、`pet`。
- 将 `inbox` 调整到沟通分组。
- 目录现为 311 个图标。

## [0.1.0-beta.1] - 2026-08-15

### 新增

- 四个对角箭头图标：`arrow-top-left`、`arrow-top-right`、`arrow-bottom-left`、`arrow-bottom-right`。
- 元数据新增 `catalogOrder`，用于文档站推荐浏览顺序。

### 变更

- 按 Figma 分类稿重排图标分类、子分组与默认目录顺序。
- 优化 `lightbulb` 图标几何结构。
- 扩展 absolute weight，支持 0.5–8 CSS 像素的数值尺寸。

## [0.1.0-beta.0] - 2026-08-12

Uplus Icon 的第一个公开 Beta 版本。

### 新增

- 发布 `@uplus-icon/core`，提供 300 个图标的框架无关 SVG definition、元数据和按名称动态访问能力。
- 发布 `@uplus-icon/react`，提供具名组件、单图标路径和用于数据驱动界面的显式 `dynamic` 入口。
- 支持完整 TypeScript 类型、标准 SVG 属性透传、`ref`、可访问标题和装饰图标默认行为。
- 增加 `weight` 与 `absoluteWeight` API，同时保持受保护 SVG 真源的内部比例和几何内容。
- 增加中英文文档，支持图标浏览、搜索、预览、复制和接入说明。

### 工程与发布

- 建立从受保护 SVG 真源和元数据注册表稳定生成代码的流程。
- 增加真实消费者安装、运行时、真源一致性、Tree Shaking 和单图标体积验证。
- 本次只发布 Core 与 React；Motion 继续保持私有，不在本次发布范围内。
