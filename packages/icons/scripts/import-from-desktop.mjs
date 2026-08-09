import { copyFile, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const sourceRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const rawDir = join(sourceRoot, 'raw')
const metadataFile = join(sourceRoot, 'metadata', 'icons.json')
const desktopDir = '/Users/upper/Desktop/icon'

const legacyMetadata = {
  "arrow-down": { "title": "Arrow Down", "titleZh": "向下箭头", "categories": ["navigation"], "tags": ["arrow", "down", "direction", "向下"], "aliases": ["move-down"] },
  "arrow-left": { "title": "Arrow Left", "titleZh": "向左箭头", "categories": ["navigation"], "tags": ["arrow", "left", "back", "previous", "向左", "返回"], "aliases": ["back", "previous"] },
  "arrow-right": { "title": "Arrow Right", "titleZh": "向右箭头", "categories": ["navigation"], "tags": ["arrow", "right", "next", "forward", "向右", "下一步"], "aliases": ["next", "forward"] },
  "arrow-up": { "title": "Arrow Up", "titleZh": "向上箭头", "categories": ["navigation"], "tags": ["arrow", "up", "direction", "向上"], "aliases": ["move-up"] },
  "bell": { "title": "Bell", "titleZh": "通知", "categories": ["communication"], "tags": ["bell", "notification", "alert", "提醒", "通知"], "aliases": ["notification"], "motion": { "generic": ["fade", "scale", "blur", "draw"], "semantic": ["ring"], "transitions": [] } },
  "chevron-down": { "title": "Chevron Down", "titleZh": "下折线", "categories": ["navigation"], "tags": ["chevron", "down", "expand", "向下", "展开"], "aliases": ["caret-down"] },
  "chevron-left": { "title": "Chevron Left", "titleZh": "左折线", "categories": ["navigation"], "tags": ["chevron", "left", "back", "向左", "返回"], "aliases": ["caret-left"] },
  "chevron-right": { "title": "Chevron Right", "titleZh": "右折线", "categories": ["navigation"], "tags": ["chevron", "right", "next", "向右", "下一步"], "aliases": ["caret-right"] },
  "chevron-up": { "title": "Chevron Up", "titleZh": "上折线", "categories": ["navigation"], "tags": ["chevron", "up", "collapse", "向上", "收起"], "aliases": ["caret-up"] },
  "clock": { "title": "Clock", "titleZh": "时钟", "categories": ["objects"], "tags": ["clock", "time", "history", "时间", "时钟"], "aliases": ["time"] },
  "close": { "title": "Close", "titleZh": "关闭", "categories": ["actions"], "tags": ["close", "remove", "cancel", "关闭", "取消"], "aliases": ["x", "cancel"] },
  "code": { "title": "Code", "titleZh": "代码", "categories": ["system"], "tags": ["code", "developer", "terminal", "代码", "开发"], "aliases": ["developer"] },
  "columns": { "title": "Columns", "titleZh": "分栏", "categories": ["layout"], "tags": ["columns", "layout", "split", "分栏", "布局"], "aliases": ["split-view"] },
  "comment": { "title": "Comment", "titleZh": "评论", "categories": ["communication"], "tags": ["comment", "message", "chat", "评论", "消息"], "aliases": ["message", "chat"] },
  "control": { "title": "Control", "titleZh": "控制", "categories": ["layout"], "tags": ["control", "adjust", "tune", "控制", "调节"], "aliases": ["adjust"] },
  "copy": { "title": "Copy", "titleZh": "复制", "categories": ["actions"], "tags": ["copy", "duplicate", "clipboard", "复制", "副本"], "aliases": ["duplicate"] },
  "download": { "title": "Download", "titleZh": "下载", "categories": ["actions"], "tags": ["download", "receive", "import", "下载", "导入"], "aliases": ["import"] },
  "edit": { "title": "Edit", "titleZh": "编辑", "categories": ["actions"], "tags": ["edit", "pencil", "write", "编辑", "修改"], "aliases": ["pencil"] },
  "file": { "title": "File", "titleZh": "文件", "categories": ["objects"], "tags": ["file", "document", "page", "文件", "文档"], "aliases": ["document"] },
  "globe": { "title": "Globe", "titleZh": "全球", "categories": ["system"], "tags": ["globe", "world", "language", "全球", "语言"], "aliases": ["world", "language"] },
  "global": { "title": "Global", "titleZh": "全球", "categories": ["system"], "tags": ["global", "globe", "world", "language", "全球", "语言"], "aliases": ["globe", "world", "language"] },
  "earth": { "title": "Earth", "titleZh": "地球", "categories": ["system"], "tags": ["earth", "globe", "world", "地球", "全球"], "aliases": [] },
  "heart": { "title": "Heart", "titleZh": "喜欢", "categories": ["status"], "tags": ["heart", "like", "favorite", "喜欢", "收藏"], "aliases": ["like", "favorite"], "motion": { "generic": ["fade", "scale", "blur", "draw"], "semantic": ["beat"], "transitions": [] } },
  "home": { "title": "Home", "titleZh": "首页", "categories": ["navigation"], "tags": ["home", "house", "start", "首页", "主页"], "aliases": ["house"] },
  "layers": { "title": "Layers", "titleZh": "图层", "categories": ["layout"], "tags": ["layers", "stack", "group", "图层", "层级"], "aliases": ["stack"] },
  "link": { "title": "Link", "titleZh": "链接", "categories": ["communication"], "tags": ["link", "chain", "url", "链接", "关联"], "aliases": ["chain", "url"] },
  "list": { "title": "List", "titleZh": "列表", "categories": ["layout"], "tags": ["list", "items", "rows", "列表", "条目"], "aliases": ["rows"] },
  "lock": { "title": "Lock", "titleZh": "锁定", "categories": ["system"], "tags": ["lock", "secure", "private", "锁定", "安全"], "aliases": ["secure"] },
  "menu": { "title": "Menu", "titleZh": "菜单", "categories": ["navigation"], "tags": ["menu", "navigation", "hamburger", "菜单", "导航"], "aliases": ["hamburger"] },
  "minus": { "title": "Minus", "titleZh": "减少", "categories": ["actions"], "tags": ["minus", "remove", "subtract", "减少", "移除"], "aliases": ["subtract"] },
  "more": { "title": "More", "titleZh": "更多", "categories": ["layout"], "tags": ["more", "ellipsis", "options", "更多", "选项"], "aliases": ["ellipsis"] },
  "phone": { "title": "Phone", "titleZh": "手机", "categories": ["communication"], "tags": ["phone", "mobile", "device", "手机", "移动设备"], "aliases": ["mobile"] },
  "play": { "title": "Play", "titleZh": "播放", "categories": ["media"], "tags": ["play", "start", "media", "播放", "开始"], "aliases": ["start"] },
  "plus": { "title": "Plus", "titleZh": "添加", "categories": ["actions"], "tags": ["plus", "add", "create", "添加", "新建"], "aliases": ["add", "create"] },
  "power": { "title": "Power", "titleZh": "电源", "categories": ["system"], "tags": ["power", "shutdown", "switch", "电源", "关机"], "aliases": ["shutdown"] },
  "refresh": { "title": "Refresh", "titleZh": "刷新", "categories": ["actions"], "tags": ["refresh", "reload", "sync", "刷新", "同步"], "aliases": ["reload", "sync"], "motion": { "generic": ["fade", "scale", "blur", "draw"], "semantic": ["rotate"], "transitions": [] } },
  "save": { "title": "Save", "titleZh": "保存", "categories": ["actions"], "tags": ["save", "store", "floppy", "保存", "存储"], "aliases": ["store"] },
  "settings": { "title": "Settings", "titleZh": "设置", "categories": ["system"], "tags": ["settings", "gear", "preferences", "设置", "偏好"], "aliases": ["gear", "preferences"] },
  "setting": { "title": "Setting", "titleZh": "设置", "categories": ["system"], "tags": ["setting", "settings", "gear", "preferences", "设置", "偏好"], "aliases": ["settings", "gear", "preferences"] },
  "share": { "title": "Share", "titleZh": "分享", "categories": ["actions"], "tags": ["share", "send", "external", "分享", "发送"], "aliases": ["send"] },
  "sidebar": { "title": "Sidebar", "titleZh": "侧边栏", "categories": ["layout"], "tags": ["sidebar", "panel", "layout", "侧边栏", "面板"], "aliases": ["panel"] },
  "sort": { "title": "Sort", "titleZh": "排序", "categories": ["actions"], "tags": ["sort", "order", "arrange", "排序", "顺序"], "aliases": ["order"] },
  "star": { "title": "Star", "titleZh": "星标", "categories": ["status"], "tags": ["star", "favorite", "rating", "星标", "收藏"], "aliases": ["rating"] },
  "task": { "title": "Task", "titleZh": "任务", "categories": ["objects"], "tags": ["task", "clipboard", "todo", "任务", "待办"], "aliases": ["todo", "clipboard"] },
  "trash": { "title": "Trash", "titleZh": "删除", "categories": ["actions"], "tags": ["trash", "delete", "remove", "删除", "回收站"], "aliases": ["delete"] },
  "unlock": { "title": "Unlock", "titleZh": "解锁", "categories": ["system"], "tags": ["unlock", "open", "unsecure", "解锁", "开放"], "aliases": ["unlocked"] },
  "upload": { "title": "Upload", "titleZh": "上传", "categories": ["actions"], "tags": ["upload", "send", "export", "上传", "导出"], "aliases": ["export"] },
  "user": { "title": "User", "titleZh": "用户", "categories": ["objects"], "tags": ["user", "person", "account", "用户", "账户"], "aliases": ["person", "account"] },
}

function validateDesignSource(file, svg) {
  const errors = []
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*\.svg$/.test(file)) errors.push('filename must use kebab-case')

  const root = svg.match(/^\s*<svg\b([^>]*)>([\s\S]*)<\/svg>\s*$/)
  if (!root) return ['must contain exactly one root <svg> element']
  const rootAttributes = root[1]
  if (!/\bwidth="24"/.test(rootAttributes) || !/\bheight="24"/.test(rootAttributes) || !/\bviewBox="0 0 24 24"/.test(rootAttributes)) {
    errors.push('root width, height, and viewBox must be 24, 24, and 0 0 24 24')
  }
  if (!/\bfill="none"/.test(rootAttributes)) errors.push('root fill must be none')

  for (const match of svg.matchAll(/\b(fill|stroke)\s*=\s*(["'])(.*?)\2/g)) {
    if (match[3] !== 'black' && match[3] !== 'none') errors.push(`${match[1]} must be black or none, received ${match[3]}`)
  }
  if (/<!--[\s\S]*?-->/.test(svg)) errors.push('comments are not allowed')
  if (/<\s*(?:mask|clipPath|filter|defs|text|image|use|foreignObject)\b/i.test(svg)) errors.push('contains unsupported structure')
  if (/\s(?:mask|clip-path|filter)\s*=|url\s*\(|javascript:|data:/i.test(svg)) errors.push('contains a prohibited reference')
  if (/\son[a-z]+\s*=/i.test(svg)) errors.push('contains an event attribute')
  if (/<rect\b[^>]*(?:width="24"[^>]*height="24"|height="24"[^>]*width="24")[^>]*fill="(?!none)[^"]+"/i.test(svg)) {
    errors.push('contains an opaque full-canvas rectangle')
  }
  return [...new Set(errors)]
}

const toTitle = (name) => name.split('-').map((part) => {
  if (/^\d+$/.test(part)) return part
  return part.charAt(0).toUpperCase() + part.slice(1)
}).join(' ')

const categoryRules = [
  [['arrow-', 'chevron', 'caret-', 'home', 'bottom', 'top', 'menu', 'minimize'], 'navigation'],
  [['play', 'pause', 'volume', 'vloume', 'camera', 'image', 'microphone'], 'media'],
  [['bell', 'comment', 'phone', 'link', 'callback', 'send', 'share'], 'communication'],
  [['heart', 'star', 'danger', 'warning', 'info', 'help', 'mistake', 'thumbs-up', 'loading', 'activity'], 'status'],
  [['settings', 'lock', 'unlock', 'code', 'globe', 'key', 'shield', 'filter', 'color', 'sun', 'moon', 'ai', 'power', 'unsafe', 'cloud'], 'system'],
  [['file', 'folder', 'book', 'calendar', 'clock', 'timer', 'user', 'briefcase', 'card', 'gift', 'coupon', 'task', 'anchor-point', 'location', 'legend', 'mouse', 'touchpad', 'cursor'], 'objects'],
  [['columns', 'sidebar', 'list', 'layers', 'separator', 'control', 'drag', 'grid', 'columns', 'more', 'sort', 'filter', 'zoom', 'crop', 'scan', 'print', 'search', 'edit', 'pen', 'pencil', 'bookmark', 'eye'], 'layout'],
]

const titleZhMap = {
  activity: '活动', ai: 'AI', 'anchor-point': '锚点', 'anchor-point-1': '锚点变体', 'arrow-down': '向下箭头',
  'arrow-left': '向左箭头', 'arrow-right': '向右箭头', 'arrow-up': '向上箭头', bell: '通知', book: '书籍',
  bookmark: '书签', 'bookmark-1': '书签变体', bottom: '底部', briefcase: '公文包', calendar: '日历',
  callback: '回拨', camera: '相机', 'camera-1': '相机变体', card: '卡片', 'card-1': '卡片变体',
  'caret-down': '下三角', 'chevron-down': '下折线', 'chevron-left': '左折线', 'chevron-right': '右折线',
  'chevron-up': '上折线', 'chevrons-down': '双下折线', 'chevrons-left': '双左折线', 'chevrons-right': '双右折线',
  'chevrons-up': '双上折线', clock: '时钟', close: '关闭', cloud: '云', code: '代码', 'code-1': '代码变体',
  color: '颜色', columns: '分栏', comment: '评论', control: '控制', 'control-1': '控制变体', copy: '复制',
  coupon: '优惠券', crop: '裁剪', cursor: '光标', danger: '危险', download: '下载', drag: '拖拽',
  'drag-1': '拖拽变体', edit: '编辑', eye: '查看', file: '文件', filter: '筛选', folder: '文件夹',
  gift: '礼物', globe: '全球', heart: '喜欢', help: '帮助', home: '首页', image: '图片', info: '信息',
  key: '密钥', layers: '图层', legend: '图例', link: '链接', list: '列表', loading: '加载中',
  location: '位置', lock: '锁定', medium: '中等', menu: '菜单', microphone: '麦克风', minimize: '最小化',
  minus: '减少', mistake: '错误', moon: '月亮', more: '更多', 'more-vertical': '更多竖排', mouse: '鼠标',
  'mouse-1': '鼠标变体', 'alarm-clock': '闹钟', 'noisy-potassium': '闹钟', 'pause': '暂停', 'pause-1': '暂停变体', pen: '钢笔',
  pencil: '铅笔', phone: '手机', 'phone-call': '通话', play: '播放', plus: '添加', power: '电源',
  print: '打印', refresh: '刷新', save: '保存', 'save-1': '保存变体', scan: '扫描', search: '搜索',
  send: '发送', separator: '分隔', settings: '设置', share: '分享', 'share-1': '分享变体', shield: '盾牌',
  sidebar: '侧边栏', sort: '排序', star: '星标', sun: '太阳', tacks: '图钉', task: '任务', text: '文本',
  'thumbs-up': '点赞', timer: '计时器', top: '顶部', touchpad: '触控板', trash: '删除', unlock: '解锁',
  unsafe: '不安全', upload: '上传', user: '用户', 'vloume-plus': '音量加', 'vloume-plus-1': '音量加变体',
  volume: '音量', warning: '警告', zoom: '缩放',
}

function inferCategory(name) {
  for (const [prefixes, category] of categoryRules) {
    if (prefixes.some((prefix) => name === prefix || name.startsWith(prefix))) return category
  }
  return 'actions'
}

function buildMetadata(name, iconNames) {
  if (legacyMetadata[name]) {
    const { motion, ...rest } = legacyMetadata[name]
    const metadata = motion ? { ...rest, motion } : { ...rest }
    metadata.aliases = metadata.aliases.filter((alias) => !iconNames.has(alias))
    return metadata
  }

  const base = name.replace(/-\d+$/, '')
  const variantMatch = name.match(/-(\d+)$/)
  const title = toTitle(name)
  const titleZh = titleZhMap[name] ?? titleZhMap[base] ?? title
  const category = inferCategory(name)
  const tags = [name, base, title.toLowerCase(), titleZh]
  const aliases = []

  const metadata = {
    title,
    titleZh,
    categories: [category],
    tags: [...new Set(tags)],
    aliases,
  }

  if (variantMatch && iconNames.has(base)) {
    metadata.related = [base]
    metadata.variants = [base]
  }

  return metadata
}

const fileRenames = {
  'QR-code.svg': 'qr-code.svg',
}

const candidates = (await readdir(desktopDir)).filter((file) => file.endsWith('.svg')).sort()
const sources = new Map()
const blocked = []
for (const file of candidates) {
  const source = await readFile(join(desktopDir, file), 'utf8')
  const errors = validateDesignSource(file, source)
  if (errors.length > 0) blocked.push({ file, errors })
  else sources.set(file, source)
}

const files = candidates.filter((file) => sources.has(file))
const iconNames = new Set(files.map((file) => basename(fileRenames[file] ?? file, '.svg')))
const metadata = {}

await rm(rawDir, { recursive: true, force: true })
await mkdir(rawDir, { recursive: true })

for (const file of files) {
  const targetFile = fileRenames[file] ?? file
  const name = basename(targetFile, '.svg')
  await copyFile(join(desktopDir, file), join(rawDir, targetFile))
  metadata[name] = buildMetadata(name, iconNames)
}

await writeFile(metadataFile, `${JSON.stringify(metadata, null, 2)}\n`, 'utf8')
await import('./sync-figma-categories.mjs')
console.log(`Imported ${files.length} protected design-source icons into ${rawDir} without modifying SVG content`)
for (const { file, errors } of blocked) console.warn(`Blocked ${file}: ${errors.join('; ')}`)
