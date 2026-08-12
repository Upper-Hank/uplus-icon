export function adaptDesignSvgBody(body) {
  return body.replace(
    /\b(fill|stroke)(\s*=\s*)(["'])black\3/g,
    (_attribute, name, separator, quote) => `${name}${separator}${quote}currentColor${quote}`,
  )
}

export function compileRuntimeSvgBody(body) {
  return adaptDesignSvgBody(body)
}
