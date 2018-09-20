import * as layoutGeometry from 'justified-layout'

type Position = { top: number; left: number; width: number; height: number }

const offscreen = (height, width = Infinity) => ({
  top: -9999,
  left: -9999,
  width,
  height
})

export default ({ gutterWidth, width }: { gutterWidth?: number; minCols?: number; width?: number }) => (
  items: Array<any>
): Array<Position> => {
  const lineHeight = 200

  if (width == null) {
    return items.map(() => offscreen(lineHeight))
  }

  const geometry = layoutGeometry(items.map(item => parseFloat(item.aspect)), {
    boxSpacing: gutterWidth,
    targetRowHeight: lineHeight,
    containerPadding: 0,
    resize: false
  })

  return geometry.boxes
}
