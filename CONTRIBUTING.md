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

`packages/icons/raw/*.svg` 是项目维护者审核确认的正式图标源文件。

- 外部贡献不得直接新增、修改、优化、格式化或覆盖原始 SVG。
- 不接受根据截图、其他图标库或主观判断重绘的正式图标。
- 如需新增或替换图标，请先提交 Issue，由项目维护者提供或批准最终 SVG。
- 发现 SVG 问题时请提交 Issue，不要直接修复源文件。
- 生成脚本只能读取原始 SVG，不得写回该目录。

详细协作约束见 `AGENTS.md`。

## 代码贡献

- 保持实现简单、清晰且向后兼容。
- 不手工编辑 `packages/icons/src/generated`。
- 修改生成逻辑后运行 `npm run generate` 并提交生成结果。
- 新行为应包含与风险相称的测试或验证。

本项目的代码和图标资产均采用 MIT License。
