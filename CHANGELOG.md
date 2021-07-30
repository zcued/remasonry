# 1.0.1-beta.9
- 使用 ResizeObserver 替代 addEventListener resize，并且使用 resize-observer-polyfill 向下兼容
- fix: 如果原始数据没有aspect，layoutGeometry将使用宽高计算
- feat: add rowHeight prop —— 横向瀑布流的行高
- feat: 当 props.columnWidth 和 props.rowHeight 改变时重新布局

# 1.1.3
- fix: 页面中同时有多个瀑布流时，共用一个cache，后渲染的瀑布流的cache.reset()会清掉所有cache，导致重新布局。
