declare type Position = {
  top: number
  left: number
  width: number
  height: number
}
declare const _default: <T>({
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
}) => (items: T[]) => Position[]
export default _default
