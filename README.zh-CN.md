<div align="center">

# Uplus Icon

一套面向现代界面的开源图标库。

提供风格一致的 SVG、类型安全的 React 组件，以及专注高效检索的图标浏览网站。

[![CI](https://github.com/Upper-Hank/uplus-icon/actions/workflows/ci.yml/badge.svg)](https://github.com/Upper-Hank/uplus-icon/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-111111.svg)](./LICENSE)
[![Status: Preview](https://img.shields.io/badge/status-preview-f59e0b.svg)](#项目状态)

[English](./README.md) · [项目官网（即将上线）](https://icon.upper.website) · [提交问题](https://github.com/Upper-Hank/uplus-icon/issues)

</div>

## 项目介绍

Uplus Icon 是一套为现代产品打造的开源图标系统。项目将经过筛选的 SVG 资产、框架无关图标数据、React 组件和文档网站统一维护在一个仓库中。

我们重视清晰、一致、无障碍和可预测的生产环境行为。正式 SVG 由维护者审核并提供，构建流程只读取 SVG，不会反向改写图标视觉数据。

## 特性

- 面向现代用户界面的统一 SVG 图标
- 框架无关的 SVG definition 和可检索元数据
- 类型安全、支持 ref 的 React 组件
- 支持单图标静态导入，控制生产包体积
- 支持显式名称渲染，适合数据驱动界面
- 支持标准 SVG 属性并忠实保留源文件渲染内容
- 合理的装饰性与语义化无障碍行为
- 搜索、分类、标签和别名元数据与 SVG 分离
- 文档站支持明暗主题
- 代码与图标资产均采用 MIT License

## 项目状态

Uplus Icon 当前处于预览阶段，图标集合、组件 API 和网站仍在持续开发。`@uplus-icon/core` 和 `@uplus-icon/react` 尚未正式发布到 npm。未来的文档网站地址为 `icon.upper.website`。

正式发布前，可以克隆仓库进行本地开发：

```bash
git clone https://github.com/Upper-Hank/uplus-icon.git
cd uplus-icon
npm install
npm run build
```

公开发布后的安装命令将是：

```bash
npm install @uplus-icon/react
```

## 使用方式

### React 组件

```tsx
import { CheckIcon } from '@uplus-icon/react'

export function SearchButton() {
  return (
    <button type="button">
      <CheckIcon size={20} />
      搜索
    </button>
  )
}
```

### 单图标导入

需要最明确、最小的静态入口时，可以使用单图标路径：

```tsx
import CheckIcon from '@uplus-icon/react/icons/check'

<CheckIcon size={24} />
```

### 名称渲染

导航配置、CMS 或其他运行时数据可以使用显式动态入口：

```tsx
import { Icon } from '@uplus-icon/react/dynamic'

<Icon name="check" size={24} />
```

该入口包含完整图标注册表；固定 UI 继续使用具名组件或单图标路径。

## 属性

所有图标都支持标准 React SVG 属性，以及以下属性：

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `size` | `number \| string` | `24` | 同时设置宽度和高度。 |
| `weight` | `number` | `2` | 描边按 `weight ÷ 2` 缩放；受支持的实心细节按 `(weight + 1) ÷ 3` 连续缩放。运行时限制在 `0.5–2`。 |
| `absoluteWeight` | `boolean` | `false` | 数值尺寸下保持 CSS 像素重量；字符串尺寸安全回退为相对重量。 |
| `title` | `string` | — | 添加 SVG 标题，并将图标暴露为图像。 |
| `color` | `string` | — | 标准 SVG 颜色属性，实际效果取决于提供的 SVG 源文件。 |
| `aria-label` | `string` | — | 为具有独立语义的图标提供无障碍名称。 |

组件的 ref 会转发到底层 `<svg>` 元素。

## 无障碍

没有 `title` 或 `aria-label` 的图标默认视为装饰元素，并设置 `aria-hidden="true"`。如果图标本身承担语义，应提供无障碍名称：

```tsx
<CheckIcon aria-label="完成" />
```

图标旁边已经存在可见按钮文字时，通常应继续保持装饰性。

## 仓库结构

```text
uplus-icon/
├── apps/
│   └── site/                 文档和图标浏览网站
├── packages/
│   ├── icons/                私有事实来源和生成工具
│   │   ├── raw/              维护者确认的 SVG，只读
│   │   ├── metadata/         搜索和分类元数据
│   │   └── scripts/          统一代码生成工具
│   ├── core/                 框架无关 definition 和元数据
│   └── react/                React 组件
├── .github/workflows/        持续集成
├── CONTRIBUTING.md
└── LICENSE
```

项目使用 npm workspaces。所有公共包和网站都来自同一份正式 SVG，确保渲染和数据一致。

## 本地开发

环境要求：Node.js 20 或更高版本，以及 npm。

```bash
npm install
npm run dev
```

常用命令：

| 命令 | 用途 |
| --- | --- |
| `npm run dev` | 启动文档网站。 |
| `npm run generate` | 根据已确认的 SVG 生成组件。 |
| `npm run typecheck` | 检查图标包和网站的 TypeScript。 |
| `npm run build` | 构建全部图标包和文档网站。 |
| `npm run check` | 执行完整 CI 检查。 |

禁止手工编辑生成文件。生成器可以读取 `packages/icons/raw`，但不得写入或优化其中的 SVG。

## 路线图

- 扩充核心界面图标
- 随图标规模扩充分类体系和多语言搜索元数据
- 改进图标浏览和复制流程
- 增加浏览器 E2E 和无障碍回归测试
- 正式发布 `@uplus-icon` 系列包
- 上线公开文档网站
- 出现真实消费者后再增加其他框架包

路线图会优先保证核心能力小而可靠，不会过早扩展大量框架或视觉变体。

## 参与贡献

欢迎贡献代码、文档、测试和工程工具。提交 Pull Request 前请阅读 [CONTRIBUTING.md](./CONTRIBUTING.md)。

原始 SVG 采用更严格的流程：除非维护者明确提供或批准最终文件，否则禁止新增、修改、重绘、优化或替换 `packages/icons/raw` 中的文件。发现图标缺失或错误时，请先提交 Issue。

## 许可证

源代码和图标资产均采用 [MIT License](./LICENSE)。
