import * as React from 'react'
import Cache from './cache'
import ScrollContainer from './scroll-container'
declare type Position = {
  top: number
  left: number
  width: number
  height: number
}
interface Props<T> {
  columnWidth?: number
  minCols?: number
  gutterWidth?: number
  /** layout === 'horizontal' 时有效 */
  maxNumRows?: number
  customScrollBuffer?: number
  cache?: Cache<any>
  renderItem: (data: {
    data: T
    itemIdx: number
    position: Position
    isMeasuring: boolean
  }) => JSX.Element
  items: Array<any>
  loadItems?: Function
  virtualize?: boolean
  /** 使用left，top 代替 transform  */
  useTransform?: boolean
  layout: 'default' | 'horizontal'
  scrollContainer?: () => HTMLElement | Window
}
interface State<T> {
  hasPendingMeasurements: boolean
  items: Array<T>
  isFetching: boolean
  scrollTop: number
  width?: number
  height: number
  itemsToMeasure: Array<T>
  itemsToRender: Array<T>
  measuringPositions: Array<Position>
  renderPositions: Array<Position>
}
declare class Masonry<T> extends React.Component<Props<T>, State<T>> {
  static defaultProps: {
    columnWidth: number
    cache: Cache<object>
    minCols: number
    gutterWidth: number
    virtualize: boolean
    layout: string
    useTransform: boolean
  }
  state: {
    hasPendingMeasurements: boolean
    items: any[]
    isFetching: boolean
    height: number
    itemsToRender: any[]
    itemsToMeasure: any[]
    measuringPositions: any[]
    renderPositions: any[]
    scrollTop: number
    width: any
  }
  containerHeight: number
  containerOffset: number
  gridWrapper?: HTMLElement
  insertAnimationFrame: any
  measureTimeout: any
  scrollContainer?: ScrollContainer
  handleResize: import('./util').F
  updateScrollPosition: import('./util').F
  measureContainerAsync: import('./util').F
  static getDerivedStateFromProps<T>(
    props: Props<T>,
    state: State<T>
  ):
    | {
        hasPendingMeasurements: boolean
        items: any[]
        isFetching: boolean
      }
    | {
        hasPendingMeasurements: boolean
        items: any[]
        isFetching?: undefined
      }
  fetchMore: () => void
  componentDidMount(): void
  componentDidUpdate({}: Props<T>, prevState: State<T>): void
  componentWillUnmount(): void
  setGridWrapperRef: (ref?: HTMLElement) => void
  setScrollContainerRef: (ref?: ScrollContainer) => void
  measureContainer(): void
  reflow(): void
  renderMasonryComponent: (item: any, idx: number, position: any) => JSX.Element
  render(): any
}
export default Masonry
