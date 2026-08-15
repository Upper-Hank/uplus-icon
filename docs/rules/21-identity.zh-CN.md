---
slug: identity
order: 21
group: governance
title: 稳定身份与重命名兼容
description: 永久图标 ID、source key、历史公共名称与发布检查
locale: zh-CN
---

## 稳定身份

每个正式图标在 `icons.json` 中都有一个永久 `id`。

- **必须**使用 `uicon_<UUID v4>` 格式。
- **必须**把 ID 视为跨版本不变的永久身份。
- **禁止**在发布后重新生成、复用或修改 ID。
- **禁止**用 SVG 内容哈希或包版本号推导 ID。

图标改名、分类或标签调整、视觉修订都不会改变 ID。

## source key 与公共名称

元数据对象 key 是稳定的 `sourceKey`，与原始 SVG 文件名一致；公共名称变化时它保持不变。

- `sourceKey` 对应 `packages/icons/raw/<sourceKey>.svg`。
- `name` 是当前公共名称，用于 `IconName`、组件导出和生成模块。
- 首次迁移时，`name` 与 source key 相同。
- 原始 SVG 文件名不跟随公共名称重命名。

## aliases 与 legacyNames

- `aliases` 只用于搜索，不承担公共 API 兼容职责。
- `legacyNames` 记录曾经发布过的公共名称，以及改名发生的版本。
- 重命名**必须**把旧公共名称写入 `legacyNames`，并提供合法的 `renamedIn` semver。
- 同一个公共名称**禁止**在不同版本间静默指向另一个 ID。

## 兼容预期

- 当记录了 `legacyNames` 时，`<Icon name="旧名称" />` 仍解析到同一个 ID。
- 弃用具名导出和历史子路径模块由 `legacyNames` 生成。
- 开发环境对每个旧名称最多警告一次；生产环境保持静默。
- `packages/icons/metadata/releases` 下的发布清单是不可变历史记录，供身份检查使用。

## 发布检查流程

1. 修改元数据后运行 `npm run check:identity -w @uplus-icon/source`。检查会使用不晚于当前包版本的最近发布清单，因此未升版的 Changesets 变更仍会对比当前已发布身份。
2. Core 与 React 完成版本更新后，运行 `npm run create-identity-manifest -w @uplus-icon/source`。
3. 创建命令会先校验当前元数据并对比严格早于新版本的最近清单；存在身份错误时**禁止**写入。
4. 同版本清单已存在时创建命令**必须**失败，不得覆盖历史记录。

## 明确不做

本规则不定义 `<Icon id="...">`、消费者 lock 文件、自动 codemod 或扫描消费者项目。这些可在身份基础设施稳定后单独设计。
