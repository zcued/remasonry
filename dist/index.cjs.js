'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = require('react');
var layoutGeometry = _interopDefault(require('justified-layout'));

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

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}

function _objectDestructuringEmpty(obj) {
  if (obj == null) throw new TypeError("Cannot destructure undefined");
}

var _this = undefined;

var throttle = function throttle(fn, wait) {
  if (wait === void 0) {
    wait = 0;
  }

  var timer, lastTime, inThrottle;

  var throttled = function throttled() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

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

  throttled.cancel = function () {
    if (timer) {
      clearTimeout(timer);
    }
  };

  return throttled;
};
var debounce = function debounce(fn, ms) {
  if (ms === void 0) {
    ms = 0;
  }

  var timer;

  var debounced = function debounced() {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    clearTimeout(timer);
    timer = setTimeout(function () {
      return fn.apply(_this, args);
    }, ms);
  };

  debounced.cancel = function () {
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

var mIndex = function mIndex(arr) {
  var idx = 0;

  for (var i = 0; i < arr.length; i++) {
    if (arr[i] < arr[idx]) {
      idx = i;
    }
  }

  return idx;
};

var offscreen = function offscreen(width, height) {
  if (height === void 0) {
    height = Infinity;
  }

  return {
    top: -9999,
    left: -9999,
    width: width,
    height: height
  };
};

var DefaultLayout = (function (_ref) {
  var cache = _ref.cache,
      columnWidth = _ref.columnWidth,
      gutterWidth = _ref.gutterWidth,
      minCols = _ref.minCols,
      width = _ref.width;
  return function (items) {
    if (width == null) {
      return items.map(function () {
        return offscreen(columnWidth);
      });
    }

    var columnWidthAndGutter = columnWidth + gutterWidth;
    var columnCount = Math.max(Math.floor((width + gutterWidth) / columnWidthAndGutter), minCols);
    var heights = new Array(columnCount).fill(0);
    var centerOffset = Math.max(Math.floor((width - columnWidthAndGutter * columnCount + gutterWidth) / 2), 0);
    return items.reduce(function (positions, item) {
      var height = cache.get(item);
      var position;

      if (height == null) {
        position = offscreen(columnWidth);
      } else {
        var heightAndGutter = height + gutterWidth;
        var col = mIndex(heights);
        var top = heights[col];
        var left = col * columnWidthAndGutter + centerOffset;
        heights[col] += heightAndGutter;
        position = {
          top: top,
          left: left,
          width: columnWidth,
          height: height
        };
      }

      positions.push(position);
      return positions;
    }, []);
  };
});

var offscreen$1 = function offscreen(height, width) {
  if (width === void 0) {
    width = Infinity;
  }

  return {
    top: -9999,
    left: -9999,
    width: width,
    height: height
  };
};

var HorizontalLayout = (function (_ref) {
  var gutterWidth = _ref.gutterWidth,
      width = _ref.width,
      _ref$maxNumRows = _ref.maxNumRows,
      maxNumRows = _ref$maxNumRows === void 0 ? Number.POSITIVE_INFINITY : _ref$maxNumRows;
  return function (items) {
    var lineHeight = 200;

    if (width == null) {
      return items.map(function () {
        return offscreen$1(lineHeight);
      });
    }

    var geometry = layoutGeometry(items.map(function (item) {
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
      maxNumRows: maxNumRows
    });
    return geometry.boxes;
  };
});

var Cache =
/*#__PURE__*/
function () {
  function Cache() {
    this.map = new WeakMap();
  }

  var _proto = Cache.prototype;

  _proto.get = function get(key) {
    return this.map.get(key);
  };

  _proto.has = function has(key) {
    return this.map.has(key);
  };

  _proto.set = function set(key, value) {
    this.map.set(key, value);
  };

  _proto.reset = function reset() {
    this.map = new WeakMap();
  };

  return Cache;
}();

function getScrollContainer(scrollContainer) {
  return typeof scrollContainer === 'function' ? scrollContainer() : scrollContainer;
}

var ScrollContainer =
/*#__PURE__*/
function (_React$Component) {
  _inheritsLoose(ScrollContainer, _React$Component);

  function ScrollContainer() {
    var _this;

    _this = _React$Component.apply(this, arguments) || this;

    _this.getScrollContainerRef = function () {
      return _this.scrollContainer;
    };

    _this.handleScroll = function (event) {
      _this.props.onScroll(event);
    };

    return _this;
  }

  var _proto = ScrollContainer.prototype;

  _proto.componentDidMount = function componentDidMount() {
    var scrollContainer = getScrollContainer(this.props.scrollContainer);

    if (!scrollContainer) {
      return;
    }

    this.updateScrollContainer(scrollContainer);
  };

  _proto.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
    var nextScrollContainer = getScrollContainer(nextProps.scrollContainer);

    if (!nextScrollContainer || nextScrollContainer === this.scrollContainer) {
      return;
    }

    this.updateScrollContainer(nextScrollContainer);
  };

  _proto.componentWillUnmount = function componentWillUnmount() {
    if (this.scrollContainer) {
      this.scrollContainer.removeEventListener('scroll', this.handleScroll);
    }
  };

  _proto.updateScrollContainer = function updateScrollContainer(scrollContainer) {
    if (this.scrollContainer) {
      // cleanup existing scroll container if it exists
      this.scrollContainer.removeEventListener('scroll', this.handleScroll);
    }

    this.scrollContainer = scrollContainer;
    this.scrollContainer.addEventListener('scroll', this.handleScroll);
  };

  _proto.render = function render() {
    return React.Children.only(this.props.children);
  };

  return ScrollContainer;
}(React.Component);

var FetchItems =
/*#__PURE__*/
function (_React$PureComponent) {
  _inheritsLoose(FetchItems, _React$PureComponent);

  function FetchItems() {
    var _this;

    _this = _React$PureComponent.apply(this, arguments) || this;

    _this.check = function () {
      var _this$props = _this.props,
          containerHeight = _this$props.containerHeight,
          isAtEnd = _this$props.isAtEnd,
          isFetching = _this$props.isFetching,
          fetchMore = _this$props.fetchMore,
          scrollHeight = _this$props.scrollHeight,
          scrollTop = _this$props.scrollTop,
          customScrollBuffer = _this$props.customScrollBuffer;

      if (isAtEnd || isFetching || !fetchMore) {
        return;
      }

      var scrollBuffer = customScrollBuffer || containerHeight * 3;

      if (scrollTop + scrollBuffer > scrollHeight) {
        fetchMore();
      }
    };

    return _this;
  }

  var _proto = FetchItems.prototype;

  _proto.componentDidMount = function componentDidMount() {
    setTimeout(this.check);
  };

  _proto.componentDidUpdate = function componentDidUpdate() {
    this.check();
  };

  _proto.render = function render() {
    return null;
  };

  return FetchItems;
}(React.PureComponent);

var RESIZE_DEBOUNCE = 300;
var VIRTUAL_BUFFER_FACTOR = 0.7;

var layoutNumberToCssDimension = function layoutNumberToCssDimension(n) {
  return n !== Infinity ? n : undefined;
}; // tslint:disable-line


var CONTAINER_STYLE = {
  position: 'relative',
  overflow: 'hidden',
  display: 'block'
};

function layoutClass(_ref, _ref2) {
  var columnWidth = _ref.columnWidth,
      gutterWidth = _ref.gutterWidth,
      layout = _ref.layout,
      cache = _ref.cache,
      minCols = _ref.minCols,
      maxNumRows = _ref.maxNumRows;
  var width = _ref2.width;

  if (layout === 'horizontal') {
    return HorizontalLayout({
      gutterWidth: gutterWidth,
      minCols: minCols,
      width: width,
      maxNumRows: maxNumRows
    });
  }

  return DefaultLayout({
    cache: cache,
    columnWidth: columnWidth,
    gutterWidth: gutterWidth,
    minCols: minCols,
    width: width
  });
}

function statesForRendering(props, state) {
  var cache = props.cache,
      minCols = props.minCols;
  var items = state.items; // Full layout is possible

  var itemsToRender = items.filter(function (item) {
    return item && cache.has(item);
  });
  var layout = layoutClass(props, state);
  var renderPositions = layout(itemsToRender); // Math.max() === -Infinity when there are no renderPositions

  var height = renderPositions.length ? Math.max.apply(Math, renderPositions.map(function (pos) {
    return pos.top + pos.height;
  })) : 0;
  var itemsToMeasure = items.filter(function (item) {
    return item && !cache.has(item);
  }).slice(0, minCols);
  var measuringPositions = layout(itemsToMeasure);
  return {
    height: height,
    itemsToRender: itemsToRender,
    itemsToMeasure: itemsToMeasure,
    measuringPositions: measuringPositions,
    renderPositions: renderPositions
  };
}

var Masonry =
/*#__PURE__*/
function (_React$Component) {
  _inheritsLoose(Masonry, _React$Component);

  function Masonry() {
    var _this;

    _this = _React$Component.apply(this, arguments) || this;
    _this.state = {
      hasPendingMeasurements: _this.props.items.some(function (item) {
        return !!item && !_this.props.cache.has(item);
      }),
      items: _this.props.items,
      isFetching: false,
      height: 0,
      itemsToRender: [],
      itemsToMeasure: [],
      measuringPositions: [],
      renderPositions: [],
      scrollTop: 0,
      width: undefined
    };
    _this.containerHeight = 0;
    _this.containerOffset = 0;
    _this.handleResize = debounce(function () {
      if (_this.gridWrapper) {
        _this.setState({
          width: _this.gridWrapper.clientWidth
        });
      }
    }, RESIZE_DEBOUNCE);
    _this.updateScrollPosition = throttle(function () {
      if (!_this.scrollContainer) {
        return;
      }

      var scrollContainer = _this.scrollContainer.getScrollContainerRef();

      if (!scrollContainer) {
        return;
      }

      _this.setState({
        scrollTop: getScrollPos(scrollContainer)
      });
    });
    _this.measureContainerAsync = debounce(function () {
      _this.measureContainer();
    }, 0);

    _this.fetchMore = function () {
      var loadItems = _this.props.loadItems;

      if (loadItems && typeof loadItems === 'function') {
        _this.setState({
          isFetching: true
        }, function () {
          return loadItems({
            from: _this.props.items.length
          });
        });
      }
    };

    _this.setGridWrapperRef = function (ref) {
      _this.gridWrapper = ref;
    };

    _this.setScrollContainerRef = function (ref) {
      _this.scrollContainer = ref;
    };

    _this.renderMasonryComponent = function (item, idx, position) {
      if (!position) {
        return null;
      }

      var _this$props = _this.props,
          Component = _this$props.renderItem,
          virtualize = _this$props.virtualize,
          useTransform = _this$props.useTransform;
      var top = position.top,
          left = position.left,
          width = position.width,
          height = position.height;
      var isVisible;

      if (_this.props.scrollContainer) {
        var virtualBuffer = _this.containerHeight * VIRTUAL_BUFFER_FACTOR;
        var offsetScrollPos = _this.state.scrollTop - _this.containerOffset;
        var viewportTop = offsetScrollPos - virtualBuffer;
        var viewportBottom = offsetScrollPos + _this.containerHeight + virtualBuffer;
        isVisible = !(position.top + position.height < viewportTop || position.top > viewportBottom);
      } else {
        isVisible = true;
      }

      var itemStyle = {
        top: 0,
        left: 0,
        position: 'absolute',
        width: layoutNumberToCssDimension(width),
        height: layoutNumberToCssDimension(height)
      };

      if (useTransform) {
        var transform = "translateX(" + left + "px) translateY(" + top + "px)";
        itemStyle.transition = 'transform 0.2s';
        itemStyle.transform = transform;
        itemStyle.WebkitTransform = transform;
      } else {
        itemStyle.left = left;
        itemStyle.top = top;
      }

      var itemComponent = React.createElement("div", {
        key: "item-" + idx,
        style: itemStyle
      }, React.createElement(Component, {
        data: item,
        itemIdx: idx,
        isMeasuring: false,
        position: position
      }));
      return virtualize ? isVisible && itemComponent || null : itemComponent;
    };

    return _this;
  }

  Masonry.getDerivedStateFromProps = function getDerivedStateFromProps(props, state) {
    var items = props.items,
        cache = props.cache;
    var hasPendingMeasurements = items.some(function (item) {
      return item && !cache.has(item);
    });

    for (var i = 0; i < items.length; i++) {
      if (state.items[i] === undefined) {
        return {
          hasPendingMeasurements: hasPendingMeasurements,
          items: items,
          isFetching: false
        };
      }

      if (items[i] !== state.items[i] || items.length < state.items.length) {
        return {
          hasPendingMeasurements: hasPendingMeasurements,
          items: items,
          isFetching: false
        };
      }
    }

    if (items.length === 0 && state.items.length > 0) {
      return {
        hasPendingMeasurements: hasPendingMeasurements,
        items: items,
        isFetching: false
      };
    }

    if (hasPendingMeasurements !== state.hasPendingMeasurements) {
      return {
        hasPendingMeasurements: hasPendingMeasurements,
        items: items
      };
    }

    return null;
  };

  var _proto = Masonry.prototype;

  _proto.componentDidMount = function componentDidMount() {
    window.addEventListener('resize', this.handleResize);
    this.measureContainer();
    var scrollTop = this.state.scrollTop;

    if (this.scrollContainer != null) {
      var scrollContainer = this.scrollContainer.getScrollContainerRef();

      if (scrollContainer) {
        scrollTop = getScrollPos(scrollContainer);
      }
    }

    var width = this.gridWrapper ? this.gridWrapper.clientWidth || this.gridWrapper.offsetWidth : this.state.width;
    this.handleResize();
    this.setState({
      scrollTop: scrollTop,
      width: width
    });
  };

  _proto.componentDidUpdate = function componentDidUpdate(_ref3, prevState) {
    var _this2 = this;

    _objectDestructuringEmpty(_ref3);

    var _this$props2 = this.props,
        items = _this$props2.items,
        cache = _this$props2.cache;
    this.measureContainerAsync();

    if (prevState.width != null && this.state.width !== prevState.width) {
      cache.reset();
    } // calculate whether we still have pending measurements


    var hasPendingMeasurements = items.some(function (item) {
      return !!item && !cache.has(item);
    });

    if (hasPendingMeasurements || hasPendingMeasurements !== this.state.hasPendingMeasurements || prevState.width == null) {
      this.insertAnimationFrame = requestAnimationFrame(function () {
        var renderingStates = statesForRendering(_this2.props, _this2.state);

        _this2.setState(_extends({
          hasPendingMeasurements: hasPendingMeasurements
        }, renderingStates));
      });
    } else if (hasPendingMeasurements || prevState.items !== items) {
      this.insertAnimationFrame = requestAnimationFrame(function () {
        var renderingStates = statesForRendering(_this2.props, _this2.state);

        _this2.setState(_extends({}, renderingStates));
      });
    }
  };

  _proto.componentWillUnmount = function componentWillUnmount() {
    if (this.insertAnimationFrame) {
      cancelAnimationFrame(this.insertAnimationFrame);
    }

    this.measureContainerAsync.cancel();
    this.handleResize.cancel();
    this.updateScrollPosition.cancel();
    window.removeEventListener('resize', this.handleResize);
  };

  _proto.measureContainer = function measureContainer() {
    if (this.scrollContainer) {
      var scrollContainer = this.scrollContainer;
      var scrollContainerRef = scrollContainer.getScrollContainerRef();

      if (scrollContainerRef != null) {
        this.containerHeight = getElementHeight(scrollContainerRef);
        var el = this.gridWrapper;

        if (el instanceof HTMLElement) {
          var relativeScrollTop = getRelativeScrollTop(scrollContainerRef);
          this.containerOffset = el.getBoundingClientRect().top + relativeScrollTop;
        }
      }
    }
  };

  _proto.reflow = function reflow() {
    this.props.cache.reset();
    this.measureContainer();
    this.forceUpdate();
  };

  _proto.render = function render() {
    var _this3 = this;

    var _this$props3 = this.props,
        columnWidth = _this$props3.columnWidth,
        Component = _this$props3.renderItem,
        cache = _this$props3.cache,
        items = _this$props3.items,
        customScrollBuffer = _this$props3.customScrollBuffer;
    var _this$state = this.state,
        hasPendingMeasurements = _this$state.hasPendingMeasurements,
        height = _this$state.height,
        itemsToMeasure = _this$state.itemsToMeasure,
        itemsToRender = _this$state.itemsToRender,
        measuringPositions = _this$state.measuringPositions,
        renderPositions = _this$state.renderPositions,
        width = _this$state.width;
    var gridBody;

    if (width == null && hasPendingMeasurements) {
      gridBody = React.createElement("div", {
        style: _extends({
          height: 0,
          width: '100%'
        }, CONTAINER_STYLE),
        ref: this.setGridWrapperRef
      }, items.map(function (item, i) {
        return React.createElement("div", {
          key: i,
          style: {
            top: 0,
            left: 0,
            transform: 'translateX(0px) translateY(0px)',
            WebkitTransform: 'translateX(0px) translateY(0px)',
            width: layoutNumberToCssDimension(columnWidth)
          },
          ref: function ref(el) {
            if (el) {
              cache.set(item, el.clientHeight);
            }
          }
        }, React.createElement(Component, {
          data: item,
          itemIdx: i,
          isMeasuring: false,
          position: {
            top: 0,
            height: 0,
            width: 0,
            left: 0
          }
        }));
      }));
    } else if (width == null) {
      gridBody = React.createElement("div", {
        style: {
          width: '100%'
        },
        ref: this.setGridWrapperRef
      });
    } else {
      gridBody = React.createElement("div", {
        style: {
          width: '100%'
        },
        ref: this.setGridWrapperRef
      }, React.createElement("div", {
        style: _extends({
          height: height,
          width: width
        }, CONTAINER_STYLE)
      }, itemsToRender.map(function (item, i) {
        return _this3.renderMasonryComponent(item, i, renderPositions[i]);
      })), itemsToMeasure.map(function (data, i) {
        var measurementIndex = itemsToRender.length + i;
        var position = measuringPositions[i];
        if (!position) return null;
        return React.createElement("div", {
          key: "measuring-" + measurementIndex,
          style: {
            visibility: 'hidden',
            position: 'absolute',
            top: layoutNumberToCssDimension(position.top),
            left: layoutNumberToCssDimension(position.left),
            width: layoutNumberToCssDimension(position.width),
            height: layoutNumberToCssDimension(position.height)
          },
          ref: function ref(el) {
            if (el) {
              cache.set(data, el.clientHeight);
            }
          }
        }, React.createElement(Component, {
          key: "measuring-" + measurementIndex + "-component",
          data: data,
          itemIdx: i,
          isMeasuring: false,
          position: position
        }));
      }), this.scrollContainer && React.createElement(FetchItems, {
        containerHeight: this.containerHeight,
        fetchMore: this.fetchMore,
        isFetching: this.state.isFetching || this.state.hasPendingMeasurements,
        scrollHeight: height,
        customScrollBuffer: customScrollBuffer,
        scrollTop: this.state.scrollTop
      }));
    }

    return this.props.scrollContainer ? React.createElement(ScrollContainer, {
      ref: this.setScrollContainerRef,
      onScroll: this.updateScrollPosition,
      scrollContainer: this.props.scrollContainer
    }, gridBody) : gridBody;
  };

  return Masonry;
}(React.Component);

Masonry.defaultProps = {
  columnWidth: 264,
  cache: new Cache(),
  minCols: 4,
  gutterWidth: 16,
  virtualize: false,
  layout: 'default',
  useTransform: true
};

exports.default = Masonry;
