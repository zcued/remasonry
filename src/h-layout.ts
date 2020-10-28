import layoutGeometry from 'justified-layout'
import { Position, BoxSpacing } from './types'

const offscreen = (height: number, width: number = Infinity) => ({
  top: -9999,
  left: -9999,
  width,
  height
})

export default ({
  gutterWidth,
  width,
  maxNumRows = Number.POSITIVE_INFINITY
}: {
  gutterWidth?: number | BoxSpacing
  minCols?: number
  width?: number
  maxNumRows?: number
}) => (items: any[]): Position[] => {
  const lineHeight = 200

  if (width == null) {
    return items.map(() => offscreen(lineHeight))
  }

  const geometry = layoutGeometry(
    items.map(item => {
      if (typeof item.aspect === 'string') {
        return parseFloat(item.aspect) || 1
      }
      return item.aspect
    }),
    {
      containerWidth: width,
      boxSpacing: gutterWidth,
      targetRowHeight: lineHeight,
      containerPadding: 0,
      resize: false,
      maxNumRows
    }
  )

  return geometry.boxes
}
