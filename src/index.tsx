import * as React from 'react'
import { debounce, throttle, getElementHeight, getRelativeScrollTop, getScrollPos } from './util'
import layout from './layout'
import Cache from './cache'
import ScrollContainer from './scroll-container'
import FetchItems from './fetch-items'

interface Props {
  columnWidth?: number
  minCols?: number
  gutterWidth?: number
  cache?: Cache<any>
  renderItem: ({ data, itemIdx, isMeasuring }: { data: any; itemIdx: number; isMeasuring: boolean }) => JSX.Element
  items: Array<any>
  loadItems?: Function
  virtualize?: boolean
  scrollContainer?: () => HTMLElement | Window
}

interface State {
  hasPendingMeasurements: boolean
  isFetching: boolean
  scrollTop: number
  width?: number
}

const RESIZE_DEBOUNCE = 300
const VIRTUAL_BUFFER_FACTOR = 0.7

const layoutNumberToCssDimension = n => (n !== Infinity ? n : undefined) // tslint:disable-line

class Masonry extends React.Component<Props, State> {
  static defaultProps = {
    columnWidth: 264,
    cache: new Cache(),
    minCols: 4,
    gutterWidth: 16,
    virtualize: false
  }

  state: State = {
    hasPendingMeasurements: this.props.items.some(item => !!item && !this.props.cache.has(item)),
    isFetching: false,
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

  renderMasonryComponent = (itemData: any, idx: number, position: any) => {
    const { renderItem: Component, virtualize } = this.props
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

    const itemComponent = (
      <div
        key={`item-${idx}`}
        data-grid-item={true}
        style={{
          top: 0,
          left: 0,
          position: 'absolute',
          transition: 'transform 0.2s',
          transform: `translateX(${left}px) translateY(${top}px)`,
          WebkitTransform: `translateX(${left}px) translateY(${top}px)`,
          width: layoutNumberToCssDimension(width),
          height: layoutNumberToCssDimension(height),
          ...(virtualize || isVisible ? {} : { display: 'none', transition: 'none' })
        }}
      >
        {React.createElement(Component, {
          data: itemData,
          itemIdx: idx,
          isMeasuring: false
        })}
      </div>
    )

    return virtualize ? (isVisible && itemComponent) || null : itemComponent
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize)

    const width = this.gridWrapper ? this.gridWrapper.clientWidth : this.state.width

    this.measureContainer()

    let { scrollTop } = this.state
    if (this.scrollContainer != null) {
      const scrollContainer = this.scrollContainer.getScrollContainerRef()
      if (scrollContainer) {
        scrollTop = getScrollPos(scrollContainer)
      }
    }

    this.setState({ scrollTop, width })
  }

  componentWillReceiveProps({ items, cache }: Props) {
    const hasPendingMeasurements = items.some(item => !cache.has(item))
    for (let i = 0; i < items.length; i += 1) {
      if (this.props.items[i] === undefined) {
        this.setState({
          hasPendingMeasurements,
          isFetching: false
        })
        return
      }

      if (items[i] !== this.props.items[i] || items.length < this.props.items.length) {
        this.setState({
          hasPendingMeasurements,
          isFetching: false
        })
        return
      }
    }

    // Reset items if new items array is empty.
    if (items.length === 0 && this.props.items.length > 0) {
      this.setState({
        hasPendingMeasurements,
        isFetching: false
      })
    } else if (hasPendingMeasurements !== this.state.hasPendingMeasurements) {
      // make sure we always update hasPendingMeasurements
      this.setState({
        hasPendingMeasurements
      })
    }
  }

  componentDidUpdate({  }: Props, prevState: State) {
    const { items, cache } = this.props

    this.measureContainerAsync()

    if (prevState.width != null && this.state.width !== prevState.width) {
      cache.reset()
    }
    const hasPendingMeasurements = items.some(item => !!item && !cache.has(item))
    if (
      hasPendingMeasurements ||
      hasPendingMeasurements !== this.state.hasPendingMeasurements ||
      prevState.width == null
    ) {
      this.insertAnimationFrame = requestAnimationFrame(() => {
        this.setState({
          hasPendingMeasurements
        })
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

  render() {
    const { columnWidth, renderItem: Component, gutterWidth, cache, items, minCols } = this.props
    const { hasPendingMeasurements, width } = this.state

    let measuredLayout = layout({
      cache,
      columnWidth,
      gutterWidth,
      minCols,
      width
    })

    let gridBody
    if (width == null && hasPendingMeasurements) {
      gridBody = (
        <div
          style={{
            height: 0,
            width: '100%',
            margin: '0 auto',
            position: 'relative'
          }}
          ref={this.setGridWrapperRef}
        >
          {items.filter(item => item).map((item, i) => (
            <div
              data-grid-item={true}
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
              {React.createElement(Component, {
                data: item,
                itemIdx: i,
                isMeasuring: false
              })}
            </div>
          ))}
        </div>
      )
    } else if (width == null) {
      gridBody = <div style={{ width: '100%' }} ref={this.setGridWrapperRef} />
    } else {
      const itemsToRender = items.filter(item => item && cache.has(item))
      const itemsToMeasure = items.filter(item => item && !cache.has(item)).slice(0, minCols)

      const positions = measuredLayout(itemsToRender)

      const measuringPositions = measuredLayout(itemsToMeasure)
      const height = Math.max(...positions.map(pos => pos.top + pos.height))
      gridBody = (
        <div style={{ width: '100%' }} ref={this.setGridWrapperRef}>
          <div
            style={{
              height,
              width,
              margin: '0 auto',
              position: 'relative'
            }}
          >
            {itemsToRender.map((item, i) => this.renderMasonryComponent(item, i, positions[i]))}
          </div>
          <div
            style={{
              height: '100%',
              width,
              margin: '0 auto',
              position: 'relative'
            }}
          >
            {itemsToMeasure.map((data, i) => {
              const position = measuringPositions[i]
              const measurementIndex = itemsToRender.length + i
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
                  {React.createElement(Component, {
                    data: data,
                    itemIdx: measurementIndex,
                    isMeasuring: true
                  })}
                </div>
              )
            })}
          </div>

          {this.scrollContainer && (
            <FetchItems
              containerHeight={this.containerHeight}
              fetchMore={this.fetchMore}
              isFetching={this.state.isFetching || this.state.hasPendingMeasurements}
              scrollHeight={height}
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
