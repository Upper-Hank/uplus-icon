# 更新日志

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
