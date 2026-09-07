export function createPublishedSvg({ viewBox, body }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="24" height="24" fill="none">\n${body.trim()}\n</svg>\n`
}

export function createSvgPackReadme(version) {
  return [
    'Uplus Icon published SVG pack',
    `Version: ${version}`,
    '',
    'Each file is a 24×24 published SVG using currentColor and the default weight (2).',
    'This pack is generated from Core definitions for download. It is not the protected design source.',
    '',
    'Uplus Icon 发布 SVG 包',
    '每个文件为 24×24、currentColor、默认线宽（2）的发布 SVG。',
    '本压缩包由 Core 定义生成，供下载使用，不是受保护的设计真源。',
    '',
    'License: MIT (see LICENSE)',
    'https://icon.upper.website',
    '',
  ].join('\n')
}
