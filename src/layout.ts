type Position = { top: number; left: number; width: number; height: number }

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
  gutterWidth?: number
  cache: any
  minCols?: number
  width?: number
}) => (items: T[]): Position[] => {
  if (width == null) {
    return items.map(() => offscreen(columnWidth))
  }

  const columnWidthAndGutter = columnWidth + gutterWidth
  const columnCount = Math.max(Math.floor((width + gutterWidth) / columnWidthAndGutter), minCols)

  const heights = new Array(columnCount).fill(0)
  const centerOffset = Math.max(
    Math.floor((width - columnWidthAndGutter * columnCount + gutterWidth) / 2),
    0
  )

  return items.reduce((positions, item) => {
    const height = cache.get(item)
    let position

    if (height == null) {
      position = offscreen(columnWidth)
    } else {
      const heightAndGutter = height + gutterWidth
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
