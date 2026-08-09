import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const sourceRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const metadataFile = join(sourceRoot, 'metadata', 'icons.json')
const categoriesFile = join(sourceRoot, 'metadata', 'categories.json')
const subgroupsFile = join(sourceRoot, 'metadata', 'subgroups.json')

/** Taxonomy from Figma node 204:17722 — Icon最新稿 */
const figmaTaxonomy = {
  actions: {
    transfer: ['download', 'upload', 'cloud-download', 'cloud-upload', 'external-link', 'share', 'send', 'transfer'],
    editing: ['plus', 'minus', 'close', 'check', 'copy', 'duplicate', 'trash', 'cut', 'edit', 'undo', 'redo'],
    session: ['power', 'login', 'logout'],
    view: ['zoom-in', 'zoom-out', 'scan', 'expand-collapse', 'maximize', 'maximize-alt', 'minimize', 'minimize-alt'],
    geometry: ['exclude', 'flip-horizontal', 'flip-vertical', 'intersect', 'mask', 'rotate-left', 'rotate-right', 'subtract', 'transform', 'union'],
    formatting: ['bold', 'heading', 'italic', 'strikethrough', 'text-alt', 'textarea', 'underline'],
    arrangement: ['set-top', 'set-medium', 'set-bottom'],
    'object-align': ['object-align-left', 'object-align-right', 'object-align-center', 'object-align-justify', 'object-align-justify-alt'],
    'text-align': ['text-align-left', 'text-align-right', 'text-align-center', 'text-align-justify', 'text-align-justify-alt'],
    management: ['archive', 'save', 'refresh', 'sync', 'search', 'pin', 'pin-off', 'filter', 'sort'],
  },
  navigation: {
    destination: ['home', 'compass'],
    chevron: ['chevron-up', 'chevron-down', 'chevron-left', 'chevron-right'],
    chevrons: ['chevrons-up', 'chevrons-down', 'chevrons-left', 'chevrons-right'],
    arrow: ['arrow-up', 'arrow-down', 'arrow-left', 'arrow-right'],
    history: ['reply'],
    trend: ['trending-down', 'trending-up'],
  },
  interface: {
    controls: ['setting', 'control-vertical', 'control-horizon', 'checkbox', 'calculator', 'tabs', 'toggle'],
    appearance: ['eye', 'eye-off', 'glasses', 'sun', 'moon', 'clarity', 'color', 'color-wheel'],
    creation: ['artboard', 'text', 'pen', 'pencil', 'ruler', 'eyedropper', 'anchor-point', 'anchor-curve', 'crop'],
    interaction: ['mouse', 'mouse-alt', 'touchpad', 'cursor', 'target', 'target-alt', 'drag', 'drag-alt'],
    data: ['pie-chart', 'chart-column-up', 'chart-column', 'gauge', 'dial'],
    structure: ['sidebar-left', 'sidebar-right', 'panel-left', 'panel-right', 'layers', 'list', 'list-ordered', 'grid', 'grid-alt', 'masonry', 'masonry-alt', 'table', 'separator', 'split-screen', 'visualization'],
    menu: ['menu', 'more-horizon', 'more-vertical'],
  },
  media: {
    playback: ['play', 'stop', 'pause', 'fast-forward', 'record', 'repeat', 'rewind', 'shuffle', 'skip-back', 'skip-forward'],
    audio: ['microphone', 'volume-up', 'volume-down', 'volume-high', 'volume-low', 'volume-off', 'volume', 'music', 'radio', 'waveform'],
    visual: ['camera', 'video', 'image', 'cast', 'vr'],
    gaming: ['game-handle'],
  },
  objects: {
    content: ['file', 'folder', 'folder-open', 'task', 'code-block', 'braces', 'book', 'bookmark', 'tag', 'mail', 'notebook', 'quote'],
    communication: ['info', 'comment', 'bell', 'bell-off', 'phone', 'headset', 'url', 'link', 'link-off'],
    technology: ['smartphone', 'tablet', 'laptop', 'monitor', 'print', 'server', 'computer', 'robot', 'qr-code', 'battery-vertical', 'battery-horizon', 'chip', 'cube', 'database', 'hard-drive', 'charge', 'git', 'floppy-disk', 'terminal', 'wifi', 'wifi-off', 'bluetooth', 'bluetooth-off'],
    time: ['clock', 'alarm-clock', 'timer', 'calendar'],
    place: ['location', 'earth', 'global', 'planet', 'cloud', 'map', 'mountain', 'skyscraper'],
    identity: ['user', 'users', 'gender-male', 'gender-transgender', 'gender-neutral', 'gender-female'],
    commerce: ['store', 'wallet', 'shopping-cart', 'shopping-bag', 'card', 'gift', 'credit-card', 'coupon', 'receipt', 'percent', 'currency', 'currency-yuan', 'currency-yen', 'currency-euro', 'currency-dollar'],
    security: ['key'],
    mineral: ['diamond'],
    life: ['cup', 'lamp', 'flashlight'],
    sport: ['football'],
    professional: ['student', 'lab', 'briefcase'],
    mobility: ['ship-rudder', 'jeep', 'plane', 'truck'],
  },
  status: {
    feedback: ['heart', 'star', 'thumbs-up', 'smile', 'success', 'uninteresting'],
    security: ['unlock', 'lock', 'shield', 'shield-check', 'unsafe'],
    alter: ['warning', 'danger', 'flag', 'help', 'mistake'],
    system: ['activity', 'bug', 'flash', 'hourglass', 'loading'],
    achievement: ['laurel', 'badge', 'sparkle'],
  },
}

const subgroupLabels = {
  transfer: ['Transfer', '传输'],
  editing: ['Editing', '编辑'],
  session: ['Session', '会话'],
  view: ['View', '视图'],
  geometry: ['Geometry', '几何'],
  formatting: ['Formatting', '格式'],
  arrangement: ['Arrangement', '排列'],
  'object-align': ['Object align', '对象对齐'],
  'text-align': ['Text align', '文本对齐'],
  management: ['Management', '管理'],
  destination: ['Destination', '目的地'],
  chevron: ['Chevron', '单折线'],
  chevrons: ['Chevrons', '双折线'],
  arrow: ['Arrow', '箭头'],
  history: ['History', '历史'],
  trend: ['Trend', '趋势'],
  controls: ['Controls', '控件'],
  appearance: ['Appearance', '外观'],
  creation: ['Creation', '创建'],
  interaction: ['Interaction', '交互'],
  data: ['Data', '数据'],
  structure: ['Structure', '结构'],
  menu: ['Menu', '菜单'],
  playback: ['Playback', '播放'],
  audio: ['Audio', '音频'],
  visual: ['Visual', '视觉'],
  gaming: ['Gaming', '游戏'],
  content: ['Content', '内容'],
  communication: ['Communication', '沟通'],
  technology: ['Technology', '技术'],
  time: ['Time', '时间'],
  place: ['Place', '地点'],
  identity: ['Identity', '身份'],
  commerce: ['Commerce', '商务'],
  security: ['Security', '安全'],
  mineral: ['Mineral', '矿物'],
  life: ['Life', '生活'],
  sport: ['Sport', '运动'],
  professional: ['Professional', '职业'],
  mobility: ['Mobility', '出行'],
  feedback: ['Feedback', '反馈'],
  alter: ['Alert', '警示'],
  system: ['System', '系统'],
  achievement: ['Achievement', '成就'],
}

const categoryRegistry = [
  { id: 'actions', title: 'Actions', titleZh: '操作', description: 'Commands, editing, transfer, and view controls' },
  { id: 'navigation', title: 'Navigation', titleZh: '导航', description: 'Direction, movement, and wayfinding' },
  { id: 'interface', title: 'Interface', titleZh: '界面', description: 'Controls, structure, creation, and interface tooling' },
  { id: 'media', title: 'Media', titleZh: '媒体', description: 'Playback, audio, visual capture, and gaming' },
  { id: 'objects', title: 'Objects', titleZh: '对象', description: 'Files, devices, places, commerce, and tangible concepts' },
  { id: 'status', title: 'Status', titleZh: '状态', description: 'Feedback, security, alerts, and system state' },
]

const assignments = new Map()
const subgroupRegistry = []

for (const [categoryId, groups] of Object.entries(figmaTaxonomy)) {
  for (const [groupId, icons] of Object.entries(groups)) {
    const [title, titleZh] = subgroupLabels[groupId] ?? [groupId, groupId]
    subgroupRegistry.push({ id: groupId, categoryId, title, titleZh })
    for (const icon of icons) {
      if (assignments.has(icon)) throw new Error(`Duplicate Figma assignment for ${icon}`)
      assignments.set(icon, { categoryId, groupId })
    }
  }
}

const metadata = JSON.parse(await readFile(metadataFile, 'utf8'))
const iconNames = Object.keys(metadata).sort()

for (const name of iconNames) {
  const assignment = assignments.get(name)
  if (!assignment) throw new Error(`Missing Figma category for ${name}`)
  const details = metadata[name]
  const { categoryId, groupId } = assignment
  const categoryMeta = categoryRegistry.find((entry) => entry.id === categoryId)
  const subgroupMeta = subgroupRegistry.find((entry) => entry.id === groupId && entry.categoryId === categoryId)
  if (!categoryMeta) throw new Error(`Missing category registry for ${categoryId}`)
  if (!subgroupMeta) throw new Error(`Missing subgroup registry for ${categoryId}/${groupId}`)
  const tags = [...new Set([
    categoryMeta.id,
    categoryMeta.title.toLowerCase(),
    categoryMeta.titleZh,
    subgroupMeta.id,
    subgroupMeta.title.toLowerCase(),
    subgroupMeta.titleZh,
  ])]

  metadata[name] = {
    ...details,
    categories: [categoryId],
    subgroup: groupId,
    tags,
  }
}

const unassigned = [...assignments.keys()].filter((name) => !(name in metadata))
if (unassigned.length > 0) throw new Error(`Figma taxonomy references missing metadata: ${unassigned.join(', ')}`)

await writeFile(categoriesFile, `${JSON.stringify(categoryRegistry, null, 2)}\n`, 'utf8')
await writeFile(subgroupsFile, `${JSON.stringify(subgroupRegistry, null, 2)}\n`, 'utf8')
await writeFile(metadataFile, `${JSON.stringify(metadata, null, 2)}\n`, 'utf8')

const counts = Object.fromEntries(categoryRegistry.map(({ id }) => [id, 0]))
for (const { categories } of Object.values(metadata)) counts[categories[0]] += 1

console.log(`Synced ${iconNames.length} icons to Figma taxonomy with ${subgroupRegistry.length} subgroups`)
console.log(counts)
