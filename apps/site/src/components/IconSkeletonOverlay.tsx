import { useMemo } from 'react'
import type { IconDefinition } from '@uplus-icon/core'

interface IconSkeletonOverlayProps {
  definition: IconDefinition
}

interface Point {
  x: number
  y: number
}

interface Handle {
  from: Point
  to: Point
}

interface SkeletonElement {
  anchors: Point[]
  controls: Point[]
  handles: Handle[]
  transform?: string
}

const numberPattern = '[-+]?(?:\\d*\\.\\d+|\\d+\\.?)(?:[eE][-+]?\\d+)?'
const pathTokenPattern = new RegExp(`[a-zA-Z]|${numberPattern}`, 'g')

function pathSkeleton(path: string): Omit<SkeletonElement, 'transform'> {
  const tokens = path.match(pathTokenPattern) ?? []
  const anchors: Point[] = []
  const controls: Point[] = []
  const handles: Handle[] = []
  let index = 0
  let command = ''
  let current = { x: 0, y: 0 }
  let subpathStart = current
  let previousControl: Point | null = null

  const isCommand = (token: string | undefined) => Boolean(token && /^[a-zA-Z]$/.test(token))
  const read = () => Number(tokens[index++])
  const point = (relative: boolean): Point => {
    const x = read()
    const y = read()
    return relative ? { x: current.x + x, y: current.y + y } : { x, y }
  }
  const reflect = (control: Point | null) => control
    ? { x: current.x * 2 - control.x, y: current.y * 2 - control.y }
    : current

  while (index < tokens.length) {
    if (isCommand(tokens[index])) command = tokens[index++]
    if (!command) break

    const relative = command === command.toLowerCase()
    switch (command.toUpperCase()) {
      case 'M': {
        current = point(relative)
        subpathStart = current
        anchors.push(current)
        previousControl = null
        command = relative ? 'l' : 'L'
        break
      }
      case 'L': {
        current = point(relative)
        anchors.push(current)
        previousControl = null
        break
      }
      case 'H': {
        const x = read()
        current = { x: relative ? current.x + x : x, y: current.y }
        anchors.push(current)
        previousControl = null
        break
      }
      case 'V': {
        const y = read()
        current = { x: current.x, y: relative ? current.y + y : y }
        anchors.push(current)
        previousControl = null
        break
      }
      case 'C': {
        const start = current
        const controlStart = point(relative)
        const controlEnd = point(relative)
        const end = point(relative)
        controls.push(controlStart, controlEnd)
        handles.push({ from: start, to: controlStart }, { from: end, to: controlEnd })
        anchors.push(end)
        current = end
        previousControl = controlEnd
        break
      }
      case 'S': {
        const start = current
        const controlStart = reflect(previousControl)
        const controlEnd = point(relative)
        const end = point(relative)
        controls.push(controlStart, controlEnd)
        handles.push({ from: start, to: controlStart }, { from: end, to: controlEnd })
        anchors.push(end)
        current = end
        previousControl = controlEnd
        break
      }
      case 'Q': {
        const start = current
        const control = point(relative)
        const end = point(relative)
        controls.push(control)
        handles.push({ from: start, to: control }, { from: end, to: control })
        anchors.push(end)
        current = end
        previousControl = control
        break
      }
      case 'T': {
        const start = current
        const control = reflect(previousControl)
        const end = point(relative)
        controls.push(control)
        handles.push({ from: start, to: control }, { from: end, to: control })
        anchors.push(end)
        current = end
        previousControl = control
        break
      }
      case 'A': {
        read()
        read()
        read()
        read()
        read()
        const end = point(relative)
        anchors.push(end)
        current = end
        previousControl = null
        break
      }
      case 'Z': {
        current = subpathStart
        previousControl = null
        command = ''
        break
      }
      default:
        return { anchors, controls, handles }
    }
  }

  return { anchors, controls, handles }
}

function geometrySkeleton(element: Element): SkeletonElement | null {
  const transform = element.getAttribute('transform') ?? undefined
  const value = (name: string) => Number(element.getAttribute(name) ?? 0)

  if (element.tagName === 'path') {
    return { ...pathSkeleton(element.getAttribute('d') ?? ''), transform }
  }

  if (element.tagName === 'rect') {
    const x = value('x')
    const y = value('y')
    const width = value('width')
    const height = value('height')
    return {
      anchors: [{ x, y }, { x: x + width, y }, { x: x + width, y: y + height }, { x, y: y + height }],
      controls: [],
      handles: [],
      transform,
    }
  }

  if (element.tagName === 'circle') {
    const cx = value('cx')
    const cy = value('cy')
    const radius = value('r')
    return {
      anchors: [
        { x: cx, y: cy - radius },
        { x: cx + radius, y: cy },
        { x: cx, y: cy + radius },
        { x: cx - radius, y: cy },
      ],
      controls: [],
      handles: [],
      transform,
    }
  }

  return null
}

function readSkeleton(definition: IconDefinition) {
  if (typeof DOMParser === 'undefined') return []
  const document = new DOMParser().parseFromString(
    `<svg xmlns="http://www.w3.org/2000/svg">${definition.body}</svg>`,
    'image/svg+xml',
  )
  return [...document.documentElement.children]
    .map(geometrySkeleton)
    .filter((element): element is SkeletonElement => element !== null)
}

export function IconSkeletonOverlay({ definition }: IconSkeletonOverlayProps) {
  const elements = useMemo(() => readSkeleton(definition), [definition])

  return (
    <svg className="icon-skeleton-overlay" viewBox={definition.viewBox} aria-hidden="true">
      <g className="skeleton-geometry" dangerouslySetInnerHTML={{ __html: definition.body }} />
      {elements.map((element, elementIndex) => (
        <g key={elementIndex} transform={element.transform}>
          {element.handles.map((handle, handleIndex) => (
            <line className="skeleton-handle" key={`handle-${handleIndex}`} x1={handle.from.x} y1={handle.from.y} x2={handle.to.x} y2={handle.to.y} strokeWidth="0.06" strokeDasharray="0.18 0.12" />
          ))}
          {element.controls.map((control, controlIndex) => (
            <circle className="skeleton-control" key={`control-${controlIndex}`} cx={control.x} cy={control.y} r="0.14" strokeWidth="0.07" />
          ))}
          {element.anchors.map((anchor, anchorIndex) => (
            <circle className="skeleton-anchor" key={`anchor-${anchorIndex}`} cx={anchor.x} cy={anchor.y} r="0.2" strokeWidth="0.09" />
          ))}
        </g>
      ))}
    </svg>
  )
}
