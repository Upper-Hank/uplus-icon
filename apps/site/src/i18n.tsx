import { createContext, useContext, type ReactNode } from 'react'

export type Language = 'en' | 'zh'

const messages = {
  en: {
    home: 'Home', icons: 'Icons', docs: 'Docs', official: 'Uplus official icon library',
    heroTitle: 'Small shapes.\nClear ideas.', heroIntro: 'A quiet, carefully drawn icon set for digital products. Built for React, designed to stay out of the way.',
    explore: 'Explore all icons', system: 'The system', consistent: 'Consistent by default.',
    gridTitle: '24 pixel grid', gridText: 'Built on a shared canvas for predictable alignment in every interface.',
    colorTitle: 'One color', colorText: 'Every icon inherits currentColor and adapts naturally to your product.',
    reactTitle: 'React ready', reactText: 'Typed components with a small, familiar API and no runtime styling.',
    clickDrop: 'Click to drop', clickAnywhere: 'Click anywhere',
    library: 'Icon library', findShape: 'Find the right shape.', search: 'Search icons…', noIcon: 'No icon found', noIconText: 'Try another name or a shorter search.',
    allIcons: 'All icons', ready: 'Ready', size: 'Size', useIcon: 'Use this icon', useText: 'Import the component and control it with standard SVG properties.', copied: 'Copied',
    docLabel: 'Documentation / v0.1', docTitle: 'Simple shapes,\nshared language.', docIntro: 'How Uplus icons are designed, built, and used across products.', onPage: 'On this page',
    principles: 'Design principles', drawing: 'Drawing icons', using: 'Using React', workflow: 'Development workflow',
    quiet: 'Quiet, clear, consistent.', quietText: 'Uplus Icon is intentionally restrained. Every shape should communicate quickly without competing with the interface around it. Icons use a shared 24 × 24 canvas, compact geometry, rounded details, and a single color.',
    gridFirst: 'Grid first', gridFirstText: 'Align important geometry to the shared pixel grid.', optical: 'Optical balance', opticalText: 'Correct by eye when mathematical alignment feels wrong.', reduce: 'Reduce', reduceText: 'Remove details that do not improve recognition.',
    built24: 'Built for 24 pixels.', built24Text: 'Source files are plain SVG with a 24 × 24 viewBox. Prefer filled silhouettes and rounded geometry. Keep paths readable, remove editor metadata, and avoid embedded colors. Black fills and strokes are converted to currentColor during generation.',
    canvas: 'Canvas', color: 'Color', format: 'Format', optimized: 'Optimized SVG', familiar: 'A small, familiar API.', familiarText: 'Import a named component for the best autocomplete and tree-shaking. Icons accept standard SVG properties alongside size and title.', dynamicText: 'For data-driven interfaces, use the generic component with a typed name:',
    oneSource: 'One source, two outputs.', oneSourceText: 'Raw SVG files live in the icon package. The generator normalizes their color and identifiers, then produces typed React components. The website consumes the same package build, so every displayed icon matches what product teams install.',
    addSvg: 'Add the SVG', addSvgText: 'Place a kebab-case file in packages/icons/raw.', generate: 'Generate and review', generateText: 'Run the build and inspect the icon in the browser grid.', release: 'Release together', releaseText: 'Version the package and update documentation as one change.',
  },
  zh: {
    home: '首页', icons: '图标', docs: '文档', official: 'Uplus 官方图标库',
    heroTitle: '小巧形状，\n清晰表达。', heroIntro: '一套安静、精心绘制的数字产品图标。为 React 构建，克制地服务于界面。',
    explore: '浏览全部图标', system: '设计系统', consistent: '默认保持一致。',
    gridTitle: '24 像素网格', gridText: '基于统一画布构建，让图标在不同界面中保持稳定对齐。',
    colorTitle: '单一颜色', colorText: '所有图标继承 currentColor，自然适配产品的颜色环境。',
    reactTitle: 'React 就绪', reactText: '提供完整类型、简洁 API，不包含运行时样式。',
    clickDrop: '点击投放', clickAnywhere: '点击任意位置',
    library: '图标库', findShape: '找到合适的形状。', search: '搜索图标…', noIcon: '未找到图标', noIconText: '尝试其他名称或更短的关键词。',
    allIcons: '全部图标', ready: '可用', size: '尺寸', useIcon: '使用这个图标', useText: '导入组件，并通过标准 SVG 属性进行控制。', copied: '已复制',
    docLabel: '文档 / v0.1', docTitle: '简单形状，\n共同语言。', docIntro: '了解 Uplus 图标如何设计、构建并应用于不同产品。', onPage: '本页目录',
    principles: '设计理念', drawing: '图标绘制', using: 'React 使用', workflow: '开发流程',
    quiet: '安静、清晰、一致。', quietText: 'Uplus Icon 有意保持克制。每个形状都应快速传达含义，同时不与周围界面争夺注意力。所有图标使用统一的 24 × 24 画布、紧凑几何、圆润细节和单一颜色。',
    gridFirst: '网格优先', gridFirstText: '将重要几何结构对齐到统一像素网格。', optical: '视觉平衡', opticalText: '当数学对齐看起来不自然时，以视觉感受进行修正。', reduce: '保持精简', reduceText: '移除不能提升识别度的细节。',
    built24: '为 24 像素而设计。', built24Text: '源文件使用 24 × 24 viewBox 的纯 SVG。优先采用实心轮廓与圆润几何，保持路径清晰，移除编辑器元数据并避免嵌入颜色。生成时会将黑色填充和描边转换为 currentColor。',
    canvas: '画布', color: '颜色', format: '格式', optimized: '优化后的 SVG', familiar: '小而熟悉的 API。', familiarText: '导入命名组件可获得更好的自动补全和 Tree Shaking。图标支持标准 SVG 属性以及 size 和 title。', dynamicText: '在数据驱动的界面中，可以使用带类型名称的通用组件：',
    oneSource: '一个源头，两种输出。', oneSourceText: '原始 SVG 保存在图标包中。生成器统一颜色与标识符并生成带类型的 React 组件。网站使用同一个包，因此展示内容始终与产品团队安装的版本一致。',
    addSvg: '添加 SVG', addSvgText: '将 kebab-case 命名的文件放入 packages/icons/raw。', generate: '生成并检查', generateText: '运行构建，并在浏览器网格中检查图标。', release: '统一发布', releaseText: '在一次变更中更新包版本与相关文档。',
  },
} as const

export type MessageKey = keyof typeof messages.en
type I18nValue = { language: Language; setLanguage: (language: Language) => void }
export const I18nContext = createContext<I18nValue>({ language: 'en', setLanguage: () => undefined })
export function I18nProvider({ value, children }: { value: I18nValue; children: ReactNode }) { return <I18nContext.Provider value={value}>{children}</I18nContext.Provider> }
export function useI18n() { const value = useContext(I18nContext); return { ...value, t: (key: MessageKey) => messages[value.language][key] } }
