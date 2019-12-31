import { Component, Children, PureComponent, createElement } from 'react';
import layoutGeometry from 'justified-layout';

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

const throttle = (fn, wait = 0) => {
  let timer, lastTime, inThrottle;

  const throttled = (...args) => {
    if (!inThrottle) {
      fn.apply(null, args);
      lastTime = Date.now();
      inThrottle = true;
    } else {
      clearTimeout(timer);
      timer = setTimeout(function () {
        if (Date.now() - lastTime >= wait) {
          fn.apply(this, args);
          lastTime = Date.now();
        }
      }, wait - (Date.now() - lastTime));
    }
  };

  throttled.cancel = () => {
    if (timer) {
      clearTimeout(timer);
    }
  };

  return throttled;
};
const debounce = (fn, ms = 0) => {
  let timer;

  const debounced = (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(undefined, args), ms);
  };

  debounced.cancel = () => {
    if (timer) {
      clearTimeout(timer);
    }
  };

  return debounced;
};
function getElementHeight(element) {
  if (element instanceof HTMLElement) {
    return element.clientHeight;
  }

  return window.innerHeight;
}
function getWindowScrollPos() {
  if (window.scrollY !== undefined) {
    // Modern browser
    return window.scrollY;
  } else if (document.documentElement && document.documentElement.scrollTop !== undefined) {
    // IE support.
    return document.documentElement.scrollTop;
  }

  return 0;
}
function getRelativeScrollTop(element) {
  if (element instanceof HTMLElement) {
    return element.scrollTop - element.getBoundingClientRect().top;
  }

  return getWindowScrollPos();
}
function getScrollPos(element) {
  if (element instanceof HTMLElement) {
    return element.scrollTop;
  }

  return getWindowScrollPos();
}

const mIndex = arr => {
  let idx = 0;

  for (let i = 0; i < arr.length; i++) {
    if (arr[i] < arr[idx]) {
      idx = i;
    }
  }

  return idx;
};

const offscreen = (width, height = Infinity) => ({
  top: -9999,
  left: -9999,
  width,
  height
});

var DefaultLayout = (({
  cache,
  columnWidth,
  gutterWidth,
  minCols,
  width
}) => items => {
  if (width == null) {
    return items.map(() => offscreen(columnWidth));
  }

  const columnWidthAndGutter = columnWidth + gutterWidth;
  const columnCount = Math.max(Math.floor((width + gutterWidth) / columnWidthAndGutter), minCols);
  const heights = new Array(columnCount).fill(0);
  const centerOffset = Math.max(Math.floor((width - columnWidthAndGutter * columnCount + gutterWidth) / 2), 0);
  return items.reduce((positions, item) => {
    const height = cache.get(item);
    let position;

    if (height == null) {
      position = offscreen(columnWidth);
    } else {
      const heightAndGutter = height + gutterWidth;
      const col = mIndex(heights);
      const top = heights[col];
      const left = col * columnWidthAndGutter + centerOffset;
      heights[col] += heightAndGutter;
      position = {
        top,
        left,
        width: columnWidth,
        height
      };
    }

    positions.push(position);
    return positions;
  }, []);
});

const offscreen$1 = (height, width = Infinity) => ({
  top: -9999,
  left: -9999,
  width,
  height
});

var HorizontalLayout = (({
  gutterWidth,
  width,
  maxNumRows = Number.POSITIVE_INFINITY
}) => items => {
  const lineHeight = 200;

  if (width == null) {
    return items.map(() => offscreen$1(lineHeight));
  }

  const geometry = layoutGeometry(items.map(item => {
    if (typeof item.aspect === 'string') {
      return parseFloat(item.aspect) || 1;
    }

    return item.aspect;
  }), {
    containerWidth: width,
    boxSpacing: gutterWidth,
    targetRowHeight: lineHeight,
    containerPadding: 0,
    resize: false,
    maxNumRows
  });
  return geometry.boxes;
});

class Cache {
  constructor() {
    this.map = new WeakMap();
  }

  get(key) {
    return this.map.get(key);
  }

  has(key) {
    return this.map.has(key);
  }

  set(key, value) {
    this.map.set(key, value);
  }

  reset() {
    this.map = new WeakMap();
  }

}

function getScrollContainer(scrollContainer) {
  return typeof scrollContainer === 'function' ? scrollContainer() : scrollContainer;
}

class ScrollContainer extends Component {
  constructor() {
    super(...arguments);

    this.getScrollContainerRef = () => this.scrollContainer;

    this.handleScroll = event => {
      this.props.onScroll(event);
    };
  }

  componentDidMount() {
    const scrollContainer = getScrollContainer(this.props.scrollContainer);

    if (!scrollContainer) {
      return;
    }

    this.updateScrollContainer(scrollContainer);
  }

  componentWillReceiveProps(nextProps) {
    const nextScrollContainer = getScrollContainer(nextProps.scrollContainer);

    if (!nextScrollContainer || nextScrollContainer === this.scrollContainer) {
      return;
    }

    this.updateScrollContainer(nextScrollContainer);
  }

  componentWillUnmount() {
    if (this.scrollContainer) {
      this.scrollContainer.removeEventListener('scroll', this.handleScroll);
    }
  }

  updateScrollContainer(scrollContainer) {
    if (this.scrollContainer) {
      // cleanup existing scroll container if it exists
      this.scrollContainer.removeEventListener('scroll', this.handleScroll);
    }

    this.scrollContainer = scrollContainer;
    this.scrollContainer.addEventListener('scroll', this.handleScroll);
  }

  render() {
    return Children.only(this.props.children);
  }

}

class FetchItems extends PureComponent {
  constructor() {
    super(...arguments);

    this.check = () => {
      const {
        containerHeight,
        isAtEnd,
        isFetching,
        fetchMore,
        scrollHeight,
        scrollTop,
        customScrollBuffer
      } = this.props;

      if (isAtEnd || isFetching || !fetchMore) {
        return;
      }

      const scrollBuffer = customScrollBuffer || containerHeight * 3;

      if (scrollTop + scrollBuffer > scrollHeight) {
        fetchMore();
      }
    };
  }

  componentDidMount() {
    setTimeout(this.check);
  }

  componentDidUpdate() {
    this.check();
  }

  render() {
    return null;
  }

}

const RESIZE_DEBOUNCE = 300;
const VIRTUAL_BUFFER_FACTOR = 0.7;

const layoutNumberToCssDimension = n => n !== Infinity ? n : undefined; // tslint:disable-line


const CONTAINER_STYLE = {
  position: 'relative',
  overflow: 'hidden',
  display: 'block'
};

function layoutClass({
  columnWidth,
  gutterWidth,
  layout,
  cache,
  minCols,
  maxNumRows
}, {
  width
}) {
  if (layout === 'horizontal') {
    return HorizontalLayout({
      gutterWidth,
      minCols,
      width,
      maxNumRows
    });
  }

  return DefaultLayout({
    cache,
    columnWidth,
    gutterWidth,
    minCols,
    width
  });
}

function statesForRendering(props, state) {
  const {
    cache,
    minCols
  } = props;
  const {
    items
  } = state; // Full layout is possible

  const itemsToRender = items.filter(item => item && cache.has(item));
  const layout = layoutClass(props, state);
  const renderPositions = layout(itemsToRender); // Math.max() === -Infinity when there are no renderPositions

  const height = renderPositions.length ? Math.max(...renderPositions.map(pos => pos.top + pos.height)) : 0;
  const itemsToMeasure = items.filter(item => item && !cache.has(item)).slice(0, minCols);
  const measuringPositions = layout(itemsToMeasure);
  return {
    height,
    itemsToRender,
    itemsToMeasure,
    measuringPositions,
    renderPositions
  };
}

class Masonry extends Component {
  constructor() {
    super(...arguments);
    this.state = {
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
    };
    this.containerHeight = 0;
    this.containerOffset = 0;
    this.handleResize = debounce(() => {
      if (this.gridWrapper) {
        this.setState({
          width: this.gridWrapper.clientWidth
        });
      }
    }, RESIZE_DEBOUNCE);
    this.updateScrollPosition = throttle(() => {
      if (!this.scrollContainer) {
        return;
      }

      const scrollContainer = this.scrollContainer.getScrollContainerRef();

      if (!scrollContainer) {
        return;
      }

      this.setState({
        scrollTop: getScrollPos(scrollContainer)
      });
    });
    this.measureContainerAsync = debounce(() => {
      this.measureContainer();
    }, 0);

    this.fetchMore = () => {
      const {
        loadItems
      } = this.props;

      if (loadItems && typeof loadItems === 'function') {
        this.setState({
          isFetching: true
        }, () => loadItems({
          from: this.props.items.length
        }));
      }
    };

    this.setGridWrapperRef = ref => {
      this.gridWrapper = ref;
    };

    this.setScrollContainerRef = ref => {
      this.scrollContainer = ref;
    };

    this.renderMasonryComponent = (item, idx, position) => {
      if (!position) {
        return null;
      }

      const {
        renderItem: Component,
        virtualize,
        useTransform
      } = this.props;
      const {
        top,
        left,
        width,
        height
      } = position;
      let isVisible;

      if (this.props.scrollContainer) {
        const virtualBuffer = this.containerHeight * VIRTUAL_BUFFER_FACTOR;
        const offsetScrollPos = this.state.scrollTop - this.containerOffset;
        const viewportTop = offsetScrollPos - virtualBuffer;
        const viewportBottom = offsetScrollPos + this.containerHeight + virtualBuffer;
        isVisible = !(position.top + position.height < viewportTop || position.top > viewportBottom);
      } else {
        isVisible = true;
      }

      let itemStyle = {
        top: 0,
        left: 0,
        position: 'absolute',
        width: layoutNumberToCssDimension(width),
        height: layoutNumberToCssDimension(height)
      };

      if (useTransform) {
        const transform = `translateX(${left}px) translateY(${top}px)`;
        itemStyle.transition = 'transform 0.2s';
        itemStyle.transform = transform;
        itemStyle.WebkitTransform = transform;
      } else {
        itemStyle.left = left;
        itemStyle.top = top;
      }

      const itemComponent = createElement("div", {
        key: `item-${idx}`,
        style: itemStyle
      }, createElement(Component, {
        data: item,
        itemIdx: idx,
        isMeasuring: false,
        position: position
      }));
      return virtualize ? isVisible && itemComponent || null : itemComponent;
    };
  }

  static getDerivedStateFromProps(props, state) {
    const {
      items,
      cache
    } = props;
    const hasPendingMeasurements = items.some(item => item && !cache.has(item));

    for (let i = 0; i < items.length; i++) {
      if (state.items[i] === undefined) {
        return {
          hasPendingMeasurements,
          items,
          isFetching: false
        };
      }

      if (items[i] !== state.items[i] || items.length < state.items.length) {
        return {
          hasPendingMeasurements,
          items,
          isFetching: false
        };
      }
    }

    if (items.length === 0 && state.items.length > 0) {
      return {
        hasPendingMeasurements,
        items,
        isFetching: false
      };
    }

    if (hasPendingMeasurements !== state.hasPendingMeasurements) {
      return {
        hasPendingMeasurements,
        items
      };
    }

    return null;
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
    this.measureContainer();
    let {
      scrollTop
    } = this.state;

    if (this.scrollContainer != null) {
      const scrollContainer = this.scrollContainer.getScrollContainerRef();

      if (scrollContainer) {
        scrollTop = getScrollPos(scrollContainer);
      }
    }

    const width = this.gridWrapper ? this.gridWrapper.clientWidth || this.gridWrapper.offsetWidth : this.state.width;
    this.handleResize();
    this.setState({
      scrollTop,
      width
    });
  }

  componentDidUpdate({}, prevState) {
    const {
      items,
      cache
    } = this.props;
    this.measureContainerAsync();

    if (prevState.width != null && this.state.width !== prevState.width) {
      cache.reset();
    } // calculate whether we still have pending measurements


    const hasPendingMeasurements = items.some(item => !!item && !cache.has(item));

    if (hasPendingMeasurements || hasPendingMeasurements !== this.state.hasPendingMeasurements || prevState.width == null) {
      this.insertAnimationFrame = requestAnimationFrame(() => {
        const renderingStates = statesForRendering(this.props, this.state);
        this.setState(_extends({
          hasPendingMeasurements
        }, renderingStates));
      });
    } else if (hasPendingMeasurements || prevState.items !== items) {
      this.insertAnimationFrame = requestAnimationFrame(() => {
        const renderingStates = statesForRendering(this.props, this.state);
        this.setState(_extends({}, renderingStates));
      });
    }
  }

  componentWillUnmount() {
    if (this.insertAnimationFrame) {
      cancelAnimationFrame(this.insertAnimationFrame);
    }

    this.measureContainerAsync.cancel();
    this.handleResize.cancel();
    this.updateScrollPosition.cancel();
    window.removeEventListener('resize', this.handleResize);
  }

  measureContainer() {
    if (this.scrollContainer) {
      const {
        scrollContainer
      } = this;
      const scrollContainerRef = scrollContainer.getScrollContainerRef();

      if (scrollContainerRef != null) {
        this.containerHeight = getElementHeight(scrollContainerRef);
        const el = this.gridWrapper;

        if (el instanceof HTMLElement) {
          const relativeScrollTop = getRelativeScrollTop(scrollContainerRef);
          this.containerOffset = el.getBoundingClientRect().top + relativeScrollTop;
        }
      }
    }
  }

  reflow() {
    this.props.cache.reset();
    this.measureContainer();
    this.forceUpdate();
  }

  render() {
    const {
      columnWidth,
      renderItem: Component,
      cache,
      items,
      customScrollBuffer
    } = this.props;
    const {
      hasPendingMeasurements,
      height,
      itemsToMeasure,
      itemsToRender,
      measuringPositions,
      renderPositions,
      width
    } = this.state;
    let gridBody;

    if (width == null && hasPendingMeasurements) {
      gridBody = createElement("div", {
        style: _extends({
          height: 0,
          width: '100%'
        }, CONTAINER_STYLE),
        ref: this.setGridWrapperRef
      }, items.map((item, i) => createElement("div", {
        key: i,
        style: {
          top: 0,
          left: 0,
          transform: 'translateX(0px) translateY(0px)',
          WebkitTransform: 'translateX(0px) translateY(0px)',
          width: layoutNumberToCssDimension(columnWidth)
        },
        ref: el => {
          if (el) {
            cache.set(item, el.clientHeight);
          }
        }
      }, createElement(Component, {
        data: item,
        itemIdx: i,
        isMeasuring: false,
        position: {
          top: 0,
          height: 0,
          width: 0,
          left: 0
        }
      }))));
    } else if (width == null) {
      gridBody = createElement("div", {
        style: {
          width: '100%'
        },
        ref: this.setGridWrapperRef
      });
    } else {
      gridBody = createElement("div", {
        style: {
          width: '100%'
        },
        ref: this.setGridWrapperRef
      }, createElement("div", {
        style: _extends({
          height,
          width
        }, CONTAINER_STYLE)
      }, itemsToRender.map((item, i) => this.renderMasonryComponent(item, i, renderPositions[i]))), itemsToMeasure.map((data, i) => {
        const measurementIndex = itemsToRender.length + i;
        const position = measuringPositions[i];
        if (!position) return null;
        return createElement("div", {
          key: `measuring-${measurementIndex}`,
          style: {
            visibility: 'hidden',
            position: 'absolute',
            top: layoutNumberToCssDimension(position.top),
            left: layoutNumberToCssDimension(position.left),
            width: layoutNumberToCssDimension(position.width),
            height: layoutNumberToCssDimension(position.height)
          },
          ref: el => {
            if (el) {
              cache.set(data, el.clientHeight);
            }
          }
        }, createElement(Component, {
          key: `measuring-${measurementIndex}-component`,
          data: data,
          itemIdx: i,
          isMeasuring: false,
          position: position
        }));
      }), this.scrollContainer && createElement(FetchItems, {
        containerHeight: this.containerHeight,
        fetchMore: this.fetchMore,
        isFetching: this.state.isFetching || this.state.hasPendingMeasurements,
        scrollHeight: height,
        customScrollBuffer: customScrollBuffer,
        scrollTop: this.state.scrollTop
      }));
    }

    return this.props.scrollContainer ? createElement(ScrollContainer, {
      ref: this.setScrollContainerRef,
      onScroll: this.updateScrollPosition,
      scrollContainer: this.props.scrollContainer
    }, gridBody) : gridBody;
  }

}

Masonry.defaultProps = {
  columnWidth: 264,
  cache: new Cache(),
  minCols: 4,
  gutterWidth: 16,
  virtualize: false,
  layout: 'default',
  useTransform: true
};

export default Masonry;
