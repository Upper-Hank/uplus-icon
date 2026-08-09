# Uplus Icon 规则文档

本文件是旧链接的兼容入口。规则正文已拆分到 `docs/rules`，Markdown 是展示网站与仓库文档共同使用的唯一正文真源。

## 核心规则

1. [系统原则与唯一真源](./rules/01-principles.zh-CN.md)
2. [语义命名与公共 API](./rules/02-naming.zh-CN.md)
3. [24px 画布与坐标系统](./rules/03-canvas.zh-CN.md)
4. [光学修正、间距与遮挡](./rules/04-optical.zh-CN.md)
5. [描边、端点、连接与圆角](./rules/05-stroke.zh-CN.md)
6. [填充、颜色、SVG 结构与导出](./rules/06-svg.zh-CN.md)
7. [元数据、分类、标签与别名](./rules/07-metadata.zh-CN.md)
8. [资产导入、审核、生成与发布](./rules/08-workflow.zh-CN.md)

## 使用文档

- [公共 API](./rules/09-api.zh-CN.md)
- [React 使用](./rules/10-react.zh-CN.md)
- [Web 使用](./rules/11-web.zh-CN.md)

## 架构与治理

- [可访问性](./rules/14-accessibility.zh-CN.md)
- [测试与质量门禁](./rules/15-testing.zh-CN.md)
- [版本、弃用与兼容性](./rules/16-versioning.zh-CN.md)
- [贡献规范](./rules/17-contribution.zh-CN.md)
- [Figma 资产协作](./rules/18-figma.zh-CN.md)
- [包与生成架构](./rules/19-package-architecture.zh-CN.md)
- [发布流程](./rules/20-release-process.zh-CN.md)

英文文档位于同一目录下对应的 `.en.md` 文件。展示网站入口为 `/docs`。

架构不变量：所有面向用户的框架包保持公共能力一致，仅使用各自平台的惯用写法表达；设计真源与生成工具始终属于私有实现。
