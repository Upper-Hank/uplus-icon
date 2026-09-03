# Contributing

感谢参与 Uplus Icon。

## 开始开发

```bash
npm install
npm run dev
```

提交前运行：

```bash
npm run check
```

## SVG 资产规则

`packages/icons/raw/**/*.svg` 是项目维护者审核确认的正式图标源文件。

- 外部贡献不得直接新增、修改、优化、格式化或覆盖原始 SVG。
- 不接受根据截图、其他图标库或主观判断重绘的正式图标。
- 如需新增或替换图标，请先提交 Issue，由项目维护者提供或批准最终 SVG。
- 发现 SVG 问题时请提交 Issue，不要直接修复源文件。
- 生成脚本只能读取原始 SVG，不得写回该目录。
- 正式 SVG 的透明背景、辅助线清理、描边/填充和元素准入规则见 [`docs/rules`](./docs/rules)；[`docs/icon-architecture.md`](./docs/icon-architecture.md) 保留为兼容目录入口。
- 新增图标时必须同步更新 `metadata/icons.json`；分类只能引用 `metadata/categories.json` 中已注册的 ID，首个分类作为展示主分组。
- 文件名使用小写英文 kebab-case，描述语义而不是外观；不添加 `icon`、`linear`、`outline` 或尺寸后缀。
- 正式源文件固定使用 `width="24" height="24" viewBox="0 0 24 24"`，描边宽度必须在 `0.5–2`。
- 每个名称只维护一份负责人确认的 `24×24` Canonical SVG。
- 不得从现有 SVG 自动生成、复制或命名其他正式资产。

详细协作约束见 `AGENTS.md`。

## 代码贡献

- 保持实现简单、清晰且向后兼容。
- 不手工编辑 `packages/core/src/generated` 或 `packages/react/src/generated`。
- 修改生成逻辑后运行 `npm run generate` 并提交生成结果。
- 新行为应包含与风险相称的测试或验证。
- 面向使用者的 Codex plugin 位于 `plugins/uplus-icon`；改动后运行 `npm run test:plugin`。它只帮助消费者查找和接入已发布的图标，不管理源 SVG 或发布流程。

本项目的代码和图标资产均采用 MIT License。
安全报告见 [SECURITY.md](./SECURITY.md)。
