import { Position, BoxSpacing } from './types'
const mIndex = (arr: number[]) => {
  let idx = 0
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] < arr[idx]) {
      idx = i
    }
  }
  return idx
}

const offscreen = (width: number, height: number = Infinity) => ({
  top: -9999,
  left: -9999,
  width,
  height
})

export default <T>({
  cache,
  columnWidth,
  gutterWidth,
  minCols,
  width
}: {
  columnWidth?: number
  gutterWidth?: number | BoxSpacing
  cache: any
  minCols?: number
  width?: number
}) => (items: T[]): Position[] => {
  if (width == null) {
    return items.map(() => offscreen(columnWidth))
  }
  const currentGutterWidth = typeof gutterWidth === 'number' ? gutterWidth : 0
  const columnWidthAndGutter = columnWidth + currentGutterWidth
  const columnCount = Math.max(
    Math.floor((width + currentGutterWidth) / columnWidthAndGutter),
    minCols
  )

  const heights = new Array(columnCount).fill(0)
  const centerOffset = Math.max(
    Math.floor((width - columnWidthAndGutter * columnCount + currentGutterWidth) / 2),
    0
  )

  return items.reduce((positions, item) => {
    const height = cache.get(item)
    let position

    if (height == null) {
      position = offscreen(columnWidth)
    } else {
      const heightAndGutter = height + currentGutterWidth
      const col = mIndex(heights)
      const top = heights[col]
      const left = col * columnWidthAndGutter + centerOffset

      heights[col] += heightAndGutter
      position = { top, left, width: columnWidth, height }
    }
    positions.push(position)
    return positions
  }, [])
}
