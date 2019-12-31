declare type Position = {
  top: number
  left: number
  width: number
  height: number
}
declare const _default: ({
  gutterWidth,
  width,
  maxNumRows
}: {
  gutterWidth?: number
  minCols?: number
  width?: number
  maxNumRows?: number
}) => (items: any[]) => Position[]
export default _default
