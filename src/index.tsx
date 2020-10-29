import * as React from 'react'
import { debounce, throttle, getElementHeight, getRelativeScrollTop, getScrollPos } from './util'
import DefaultLayout from './layout'
import HorizontalLayout from './h-layout'
import Cache from './cache'
import ScrollContainer from './scroll-container'
import FetchItems from './fetch-items'
import { Position, BoxSpacing } from './types'

interface Props<T> {
  columnWidth?: number
  minCols?: number
  gutterWidth?: number | BoxSpacing
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

const RESIZE_DEBOUNCE = 300
const VIRTUAL_BUFFER_FACTOR = 0.7

const layoutNumberToCssDimension = n => (n !== Infinity ? n : undefined) // tslint:disable-line

const CONTAINER_STYLE: {
  position: any
  overflow: any
  display: any
} = {
  position: 'relative',
  overflow: 'hidden',
  display: 'block'
}

function layoutClass<T>(
  { columnWidth, gutterWidth, layout, cache, minCols, maxNumRows }: Props<T>,
  { width }: State<T>
) {
  if (layout === 'horizontal') {
    return HorizontalLayout({
      gutterWidth,
      minCols,
      width,
      maxNumRows
    })
  }

  return DefaultLayout<T>({
    cache,
    columnWidth,
    gutterWidth,
    minCols,
    width
  })
}

function statesForRendering<T>(props: Props<T>, state: State<T>) {
  const { cache, minCols } = props
  const { items } = state

  // Full layout is possible
  const itemsToRender = items.filter(item => item && cache.has(item))

  const layout = layoutClass(props, state)
  const renderPositions = layout(itemsToRender)
  // Math.max() === -Infinity when there are no renderPositions
  const height = renderPositions.length
    ? Math.max(...renderPositions.map(pos => pos.top + pos.height))
    : 0

  const itemsToMeasure = items.filter(item => item && !cache.has(item)).slice(0, minCols)
  const measuringPositions = layout(itemsToMeasure)

  return {
    height,
    itemsToRender,
    itemsToMeasure,
    measuringPositions,
    renderPositions
  }
}

class Masonry<T> extends React.Component<Props<T>, State<T>> {
  static defaultProps = {
    columnWidth: 264,
    cache: new Cache(),
    minCols: 4,
    gutterWidth: 16,
    virtualize: false,
    layout: 'default',
    useTransform: true
  }

  state = {
    hasPendingMeasurements: this.props.items.some(item => !!item && !this.props.cache.has(item)),
    items: this.props.items,
    isFetching: false,
    height: 0,
    itemsToRender: [],
    itemsToMeasure: [],
    measuringPositions: [],
    renderPositions: [],
    scrollTop: 0,
    width: undefined
  }

  containerHeight: number = 0
  containerOffset: number = 0
  gridWrapper?: HTMLElement
  insertAnimationFrame: any
  measureTimeout: any
  scrollContainer?: ScrollContainer

  handleResize = debounce(() => {
    if (this.gridWrapper) {
      this.setState({ width: this.gridWrapper.clientWidth })
    }
  }, RESIZE_DEBOUNCE)

  updateScrollPosition = throttle(() => {
    if (!this.scrollContainer) {
      return
    }
    const scrollContainer = this.scrollContainer.getScrollContainerRef()

    if (!scrollContainer) {
      return
    }

    this.setState({
      scrollTop: getScrollPos(scrollContainer)
    })
  })

  measureContainerAsync = debounce(() => {
    this.measureContainer()
  }, 0)

  static getDerivedStateFromProps<T>(props: Props<T>, state: State<T>) {
    const { items, cache } = props

    const hasPendingMeasurements = items.some(item => item && !cache.has(item))

    for (let i = 0; i < items.length; i++) {
      if (state.items[i] === undefined) {
        return {
          hasPendingMeasurements,
          items,
          isFetching: false
        }
      }

      if (items[i] !== state.items[i] || items.length < state.items.length) {
        return {
          hasPendingMeasurements,
          items,
          isFetching: false
        }
      }
    }

    if (items.length === 0 && state.items.length > 0) {
      return {
        hasPendingMeasurements,
        items,
        isFetching: false
      }
    }

    if (hasPendingMeasurements !== state.hasPendingMeasurements) {
      return {
        hasPendingMeasurements,
        items
      }
    }

    return null
  }

  fetchMore = () => {
    const { loadItems } = this.props
    if (loadItems && typeof loadItems === 'function') {
      this.setState(
        {
          isFetching: true
        },
        () => loadItems({ from: this.props.items.length })
      )
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize)

    this.measureContainer()

    let { scrollTop } = this.state
    if (this.scrollContainer != null) {
      const scrollContainer = this.scrollContainer.getScrollContainerRef()
      if (scrollContainer) {
        scrollTop = getScrollPos(scrollContainer)
      }
    }

    const width = this.gridWrapper
      ? this.gridWrapper.clientWidth || this.gridWrapper.offsetWidth
      : this.state.width

    this.handleResize()
    this.setState({ scrollTop, width })
  }

  componentDidUpdate({}: Props<T>, prevState: State<T>) {
    const { items, cache } = this.props
    this.measureContainerAsync()

    if (prevState.width != null && this.state.width !== prevState.width) {
      cache.reset()
    }
    // calculate whether we still have pending measurements
    const hasPendingMeasurements = items.some(item => !!item && !cache.has(item))

    if (
      hasPendingMeasurements ||
      hasPendingMeasurements !== this.state.hasPendingMeasurements ||
      prevState.width == null
    ) {
      this.insertAnimationFrame = requestAnimationFrame(() => {
        const renderingStates = statesForRendering(this.props, this.state)
        this.setState({
          hasPendingMeasurements,
          ...renderingStates
        })
      })
    } else if (hasPendingMeasurements || prevState.items !== items) {
      this.insertAnimationFrame = requestAnimationFrame(() => {
        const renderingStates = statesForRendering(this.props, this.state)
        this.setState({ ...renderingStates })
      })
    }
  }

  componentWillUnmount() {
    if (this.insertAnimationFrame) {
      cancelAnimationFrame(this.insertAnimationFrame)
    }

    this.measureContainerAsync.cancel()
    this.handleResize.cancel()
    this.updateScrollPosition.cancel()

    window.removeEventListener('resize', this.handleResize)
  }

  setGridWrapperRef = (ref?: HTMLElement) => {
    this.gridWrapper = ref
  }

  setScrollContainerRef = (ref?: ScrollContainer) => {
    this.scrollContainer = ref
  }

  measureContainer() {
    if (this.scrollContainer) {
      const { scrollContainer } = this
      const scrollContainerRef = scrollContainer.getScrollContainerRef()
      if (scrollContainerRef != null) {
        this.containerHeight = getElementHeight(scrollContainerRef)
        const el = this.gridWrapper
        if (el instanceof HTMLElement) {
          const relativeScrollTop = getRelativeScrollTop(scrollContainerRef)
          this.containerOffset = el.getBoundingClientRect().top + relativeScrollTop
        }
      }
    }
  }

  reflow() {
    this.props.cache.reset()
    this.measureContainer()
    this.forceUpdate()
  }

  renderMasonryComponent = (item: any, idx: number, position: any) => {
    if (!position) {
      return null
    }

    const { renderItem: Component, virtualize, useTransform } = this.props
    const { top, left, width, height } = position

    let isVisible
    if (this.props.scrollContainer) {
      const virtualBuffer = this.containerHeight * VIRTUAL_BUFFER_FACTOR
      const offsetScrollPos = this.state.scrollTop - this.containerOffset
      const viewportTop = offsetScrollPos - virtualBuffer
      const viewportBottom = offsetScrollPos + this.containerHeight + virtualBuffer

      isVisible = !(position.top + position.height < viewportTop || position.top > viewportBottom)
    } else {
      isVisible = true
    }

    let itemStyle: any = {
      top: 0,
      left: 0,
      position: 'absolute',
      width: layoutNumberToCssDimension(width),
      height: layoutNumberToCssDimension(height)
    }

    if (useTransform) {
      const transform = `translateX(${left}px) translateY(${top}px)`
      itemStyle.transition = 'transform 0.2s'
      itemStyle.transform = transform
      itemStyle.WebkitTransform = transform
    } else {
      itemStyle.left = left
      itemStyle.top = top
    }

    const itemComponent = (
      <div key={`item-${idx}`} style={itemStyle}>
        <Component data={item} itemIdx={idx} isMeasuring={false} position={position} />
      </div>
    )

    return virtualize ? (isVisible && itemComponent) || null : itemComponent
  }

  render() {
    const { columnWidth, renderItem: Component, cache, items, customScrollBuffer } = this.props

    const {
      hasPendingMeasurements,
      height,
      itemsToMeasure,
      itemsToRender,
      measuringPositions,
      renderPositions,
      width
    } = this.state

    let gridBody
    if (width == null && hasPendingMeasurements) {
      gridBody = (
        <div
          style={{
            height: 0,
            width: '100%',
            ...CONTAINER_STYLE
          }}
          ref={this.setGridWrapperRef}
        >
          {items.map((item, i) => (
            <div
              key={i}
              style={{
                top: 0,
                left: 0,
                transform: 'translateX(0px) translateY(0px)',
                WebkitTransform: 'translateX(0px) translateY(0px)',
                width: layoutNumberToCssDimension(columnWidth)
              }}
              ref={el => {
                if (el) {
                  cache.set(item, el.clientHeight)
                }
              }}
            >
              <Component
                data={item}
                itemIdx={i}
                isMeasuring={false}
                position={{ top: 0, height: 0, width: 0, left: 0 }}
              />
            </div>
          ))}
        </div>
      )
    } else if (width == null) {
      gridBody = <div style={{ width: '100%' }} ref={this.setGridWrapperRef} />
    } else {
      gridBody = (
        <div style={{ width: '100%' }} ref={this.setGridWrapperRef}>
          <div
            style={{
              height,
              width,
              ...CONTAINER_STYLE
            }}
          >
            {itemsToRender.map((item, i) =>
              this.renderMasonryComponent(item, i, renderPositions[i])
            )}
          </div>
          {itemsToMeasure.map((data, i) => {
            const measurementIndex = itemsToRender.length + i
            const position = measuringPositions[i]

            if (!position) return null
            return (
              <div
                key={`measuring-${measurementIndex}`}
                style={{
                  visibility: 'hidden',
                  position: 'absolute',
                  top: layoutNumberToCssDimension(position.top),
                  left: layoutNumberToCssDimension(position.left),
                  width: layoutNumberToCssDimension(position.width),
                  height: layoutNumberToCssDimension(position.height)
                }}
                ref={el => {
                  if (el) {
                    cache.set(data, el.clientHeight)
                  }
                }}
              >
                <Component
                  key={`measuring-${measurementIndex}-component`}
                  data={data}
                  itemIdx={i}
                  isMeasuring={false}
                  position={position}
                />
              </div>
            )
          })}
          {this.scrollContainer && (
            <FetchItems
              containerHeight={this.containerHeight}
              fetchMore={this.fetchMore}
              isFetching={this.state.isFetching || this.state.hasPendingMeasurements}
              scrollHeight={height}
              customScrollBuffer={customScrollBuffer}
              scrollTop={this.state.scrollTop}
            />
          )}
        </div>
      )
    }

    return this.props.scrollContainer ? (
      <ScrollContainer
        ref={this.setScrollContainerRef}
        onScroll={this.updateScrollPosition}
        scrollContainer={this.props.scrollContainer}
      >
        {gridBody}
      </ScrollContainer>
    ) : (
      gridBody
    )
  }
}

export default Masonry
