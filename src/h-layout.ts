import layoutGeometry from 'justified-layout'
import { Position, BoxSpacing } from './types'

const offscreen = (height: number, width: number = 0) => ({
  top: -9999,
  left: -9999,
  width,
  height
})

export default ({
  rowHeight,
  gutterWidth,
  width,
  maxNumRows = Number.POSITIVE_INFINITY
}: {
  rowHeight?: number
  gutterWidth?: number | BoxSpacing
  width?: number
  maxNumRows?: number
}) => (items: any[]): Position[] => {
  const lineHeight = rowHeight || 200

  if (width == null) {
    return items.map(() => offscreen(lineHeight))
  }

  const geometry = layoutGeometry(
    items.map(item => {
      if (typeof item.aspect === 'string') {
        return parseFloat(item.aspect) || 1
      }
      return item.aspect || item
    }),
    {
      containerWidth: width,
      boxSpacing: gutterWidth,
      targetRowHeight: lineHeight,
      containerPadding: 0,
      maxNumRows
    }
  )

  return geometry.boxes
}
