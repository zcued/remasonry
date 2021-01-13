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

const offscreen = (width: number, height: number = 0) => ({
  top: -9999,
  left: -9999,
  width,
  height
})

export default <T>({
  columnWidth,
  gutterWidth,
  minCols,
  width
}: {
  columnWidth?: number
  gutterWidth?: number | BoxSpacing
  minCols?: number
  width?: number
}) => (items: T[]): Position[] => {
  if (width == null) {
    return items.map(() => offscreen(columnWidth))
  }
  const currentGutterWidth = typeof gutterWidth === 'object' ? gutterWidth.horizontal : gutterWidth
  const currentGutterheight = typeof gutterWidth === 'object' ? gutterWidth.vertical : gutterWidth
  const columnWidthAndGutter = columnWidth + currentGutterWidth
  const columnCount = Math.max(
    Math.floor((width + currentGutterWidth) / columnWidthAndGutter),
    minCols
  )

  const realColumnWidth = Math.floor((width - currentGutterWidth * (columnCount - 1)) / columnCount)
  const heights = new Array(columnCount).fill(0)

  return items.reduce((positions, item: any) => {
    const aspect = item.aspect ? Number(item.aspect) : item.width / item.height
    const height = realColumnWidth / aspect
    let position

    if (height == null) {
      position = offscreen(realColumnWidth)
    } else {
      const heightAndGutter = height + currentGutterheight
      const col = mIndex(heights)
      const top = heights[col]
      const left = col * (realColumnWidth + currentGutterWidth)

      heights[col] += heightAndGutter
      position = { top, left, width: realColumnWidth, height }
    }
    positions.push(position)
    return positions
  }, [])
}
