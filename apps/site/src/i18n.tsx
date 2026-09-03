import { createContext, useContext, type ReactNode } from 'react'

export type Language = 'en' | 'zh'

export const messages = {
  en: {
    home: 'Home', icons: 'Icons', docs: 'Docs', official: 'Uplus official icon library',
    heroTitle: 'Good enough icons', heroIntro: 'Linear icons. Completely free.',
    explore: 'Explore all icons', system: 'The system', consistent: 'Consistent by default.',
    gridTitle: '24 pixel grid', gridText: 'Built on a shared canvas for predictable alignment in every interface.',
    colorTitle: 'Source faithful', colorText: 'Every icon preserves the visual content supplied in its approved SVG source.',
    reactTitle: 'React ready', reactText: 'Typed components with a small, familiar API and no runtime styling.',
    clickDrop: 'Click to drop', clickAnywhere: 'Click anywhere',
    publicBeta: 'Public Beta', liveIconField: 'Live icon field',
    loading: 'Loading…', copyFailed: 'Copy failed', copyInstallCommand: 'Copy install command', installCopied: 'Install command copied',
    pageNotFound: 'Page not found', pageNotFoundText: 'This address may have changed or never existed.', goHome: 'Go home', browseIcons: 'Browse icons',
    appearance: 'Appearance', languageLabel: 'Language', searchIcons: 'Search icons', clearSearch: 'Clear search',
    pageError: 'This page failed to load', pageErrorText: 'You can retry, or go back to the home page.', retry: 'Retry',
    physicsSample: 'A sample of Uplus icons',
    physicsInteractive: 'An interactive, decorative field of falling icons',
    library: 'Icon library', findShape: 'Find the right shape.', search: 'Search icons…', noIcon: 'No icon found', noIconText: 'Try another name or a shorter search.',
    allIcons: 'All icons', ready: 'Ready', size: 'Size', useIcon: 'Use this icon', useText: 'Import the component and control it with standard SVG properties.', copied: 'Copied',
    docLabel: 'Documentation / v0.1', docTitle: 'Simple shapes,\nshared language.', docIntro: 'How Uplus icons are designed, built, and used across products.', onPage: 'On this page',
    principles: 'Design principles', drawing: 'Drawing icons', using: 'Using React', workflow: 'Development workflow',
    quiet: 'Quiet, clear, consistent.', quietText: 'Uplus Icon is intentionally restrained. Every shape should communicate quickly without competing with the interface around it. Icons use a shared 24 × 24 canvas, compact geometry, rounded details, and a single color.',
    gridFirst: 'Grid first', gridFirstText: 'Align important geometry to the shared pixel grid.', optical: 'Optical balance', opticalText: 'Correct by eye when mathematical alignment feels wrong.', reduce: 'Reduce', reduceText: 'Remove details that do not improve recognition.',
    built24: 'Built for 24 pixels.', built24Text: 'Every source SVG is reviewed and supplied by the maintainer. Source artwork remains unchanged; metadata and generated React code are maintained separately.',
    canvas: 'Canvas', color: 'Color', format: 'Format', optimized: 'Optimized SVG', familiar: 'A small, familiar API.', familiarText: 'Import a named component for the best autocomplete and tree-shaking. Icons accept standard SVG properties alongside size and title.', dynamicText: 'For data-driven interfaces, use the generic component with a typed name:',
    oneSource: 'One source, two outputs.', oneSourceText: 'Approved SVG files live in the icon package as read-only assets. The generator reads them to produce typed React components without writing back to the source files. The website consumes the same package build.',
    addSvg: 'Approve the SVG', addSvgText: 'The maintainer supplies or explicitly approves the final SVG.', generate: 'Generate and review', generateText: 'Generate React components and inspect the result without rewriting the source SVG.', release: 'Release together', releaseText: 'Version the package and update documentation as one change.',
  },
  zh: {
    home: '首页', icons: '图标', docs: '文档', official: 'Uplus 官方图标库',
    heroTitle: '足够好的图标', heroIntro: '线性图标，开源免费',
    explore: '浏览全部图标', system: '设计系统', consistent: '默认保持一致。',
    gridTitle: '24 像素网格', gridText: '基于统一画布构建，让图标在不同界面中保持稳定对齐。',
    colorTitle: '忠于源文件', colorText: '每个图标都完整保留已审核 SVG 中提供的视觉内容。',
    reactTitle: 'React 就绪', reactText: '提供完整类型、简洁 API，不包含运行时样式。',
    clickDrop: '点击投放', clickAnywhere: '点击任意位置',
    publicBeta: '公开 Beta', liveIconField: '实时图标场',
    loading: '正在加载…', copyFailed: '复制失败', copyInstallCommand: '复制安装命令', installCopied: '安装命令已复制',
    pageNotFound: '页面不存在', pageNotFoundText: '这个地址可能已变更，或者从未存在。', goHome: '返回首页', browseIcons: '浏览图标',
    appearance: '外观', languageLabel: '语言', searchIcons: '搜索图标', clearSearch: '清除搜索',
    pageError: '这个页面出错了', pageErrorText: '可以重试，或者返回首页继续浏览。', retry: '重试',
    physicsSample: 'Uplus 图标样例展示',
    physicsInteractive: '可交互的图标物理场，装饰性内容',
    library: '图标库', findShape: '找到合适的形状。', search: '搜索图标…', noIcon: '未找到图标', noIconText: '尝试其他名称或更短的关键词。',
    allIcons: '全部图标', ready: '可用', size: '尺寸', useIcon: '使用这个图标', useText: '导入组件，并通过标准 SVG 属性进行控制。', copied: '已复制',
    docLabel: '文档 / v0.1', docTitle: '简单形状，\n共同语言。', docIntro: '了解 Uplus 图标如何设计、构建并应用于不同产品。', onPage: '本页目录',
    principles: '设计理念', drawing: '图标绘制', using: 'React 使用', workflow: '开发流程',
    quiet: '安静、清晰、一致。', quietText: 'Uplus Icon 有意保持克制。每个形状都应快速传达含义，同时不与周围界面争夺注意力。所有图标使用统一的 24 × 24 画布、紧凑几何、圆润细节和单一颜色。',
    gridFirst: '网格优先', gridFirstText: '将重要几何结构对齐到统一像素网格。', optical: '视觉平衡', opticalText: '当数学对齐看起来不自然时，以视觉感受进行修正。', reduce: '保持精简', reduceText: '移除不能提升识别度的细节。',
    built24: '为 24 像素而设计。', built24Text: '所有正式 SVG 都由维护者审核并提供。源图形保持原样，元数据和生成的 React 代码与 SVG 分离维护。',
    canvas: '画布', color: '颜色', format: '格式', optimized: '优化后的 SVG', familiar: '小而熟悉的 API。', familiarText: '导入命名组件可获得更好的自动补全和 Tree Shaking。图标支持标准 SVG 属性以及 size 和 title。', dynamicText: '在数据驱动的界面中，可以使用带类型名称的通用组件：',
    oneSource: '一个源头，两种输出。', oneSourceText: '审核通过的 SVG 作为只读资产保存在图标包中。生成器只读取这些文件并生成带类型的 React 组件，不会写回源文件。网站使用同一个包。',
    addSvg: '确认 SVG', addSvgText: '最终 SVG 只能由维护者提供或明确批准。', generate: '生成并检查', generateText: '生成 React 组件并检查结果，不改写源 SVG。', release: '统一发布', releaseText: '在一次变更中更新包版本与相关文档。',
  },
} as const

export type MessageKey = keyof typeof messages.en
type I18nValue = { language: Language; setLanguage: (language: Language) => void }
export const I18nContext = createContext<I18nValue>({ language: 'en', setLanguage: () => undefined })
export function I18nProvider({ value, children }: { value: I18nValue; children: ReactNode }) { return <I18nContext.Provider value={value}>{children}</I18nContext.Provider> }
export function useI18n() { const value = useContext(I18nContext); return { ...value, t: (key: MessageKey) => messages[value.language][key] } }
