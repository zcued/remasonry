type Position = { top: number; left: number; width: number; height: number }

function getGreedyCount(rowWidth: number, rowHeight: number, items: Array<any>, offset: number, gutterWidth: number) {
  let count = 0
  for (let i = offset, width = 0; i < items.length && width <= rowWidth; i++) {
    width += items[i].aspect * rowHeight + gutterWidth
    count++
  }
  return count
}

function getContentSize(
  rowWidth: number,
  options: any,
  items: Array<any>,
  offset: number,
  gutterWidth: number,
  count: number
) {
  let originWidth = 0
  for (let i = count - 1; i >= 0; i--) {
    let meta = items[offset + i]
    originWidth += meta.aspect * options.lineHeight
    if (i !== 0) {
      originWidth += gutterWidth
    }
  }
  let fitHeight = (options.lineHeight * rowWidth) / originWidth
  let canFit = fitHeight <= options.maxLineHeight && fitHeight >= options.minLineHeight
  if (canFit) {
    return {
      cost: Math.abs(options.lineHeight - fitHeight),
      count: count,
      width: rowWidth,
      height: fitHeight
    }
  } else {
    let height = originWidth > rowWidth ? options.minLineHeight : options.maxLineHeight
    return {
      cost: Infinity,
      count: count,
      width: (originWidth * height) / options.lineHeight,
      height: height
    }
  }
}

function chooseFinalSize(lazySize: any, greedySize: any, rowWidth: number) {
  if (lazySize.cost === Infinity && greedySize.cost === Infinity) {
    return greedySize.width < rowWidth ? greedySize : lazySize
  } else {
    return greedySize.cost >= lazySize.cost ? lazySize : greedySize
  }
}

const offscreen = (height, width = Infinity) => ({
  top: -9999,
  left: -9999,
  width,
  height
})

export default ({
  singleMaxWidth = 256,
  minLineHeight = 160,
  maxLineHeight = 256,
  gutterWidth,
  width
}: {
  singleMaxWidth?: number
  minLineHeight?: number
  maxLineHeight?: number
  gutterWidth?: number
  minCols?: number
  width?: number
}) => (items: Array<any>): Array<Position> => {
  const lineHeight = 200
  if (width == null) {
    return items.map(() => offscreen(lineHeight))
  }

  let total = items.length
  let top = 0
  let offset = 0
  let positions = []

  let options = {
    lineHeight,
    minLineHeight,
    maxLineHeight,
    singleMaxWidth
  }

  while (offset < total) {
    let greedyCount = getGreedyCount(width, options.lineHeight, items, offset, gutterWidth)
    let lazyCount = Math.max(greedyCount - 1, 1)
    let greedySize = getContentSize(width, options, items, offset, gutterWidth, greedyCount)
    let lazySize = getContentSize(width, options, items, offset, gutterWidth, lazyCount)
    let finalSize = chooseFinalSize(lazySize, greedySize, width)
    let height = finalSize.height
    let fitContentWidth = finalSize.width
    if (finalSize.count === 1) {
      fitContentWidth = Math.min(options.singleMaxWidth, width)
      height = items[offset].aspect * fitContentWidth
    }
    let strategy = {
      left: 0,
      count: finalSize.count,
      height: height
    }

    for (let i = 0, left = 0, meta; i < strategy.count; i++) {
      meta = items[offset + i]
      let position = {
        top,
        left: strategy.left + left,
        width: Number((strategy.height * meta.aspect).toFixed(2)),
        height: Number(strategy.height.toFixed(2))
      }
      positions.push(position)
      left += position.width + gutterWidth
    }
    offset += strategy.count
    top += strategy.height + gutterWidth
  }

  return positions
}
