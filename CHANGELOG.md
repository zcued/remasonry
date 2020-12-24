# 1.0.1-beta.9
- 使用 ResizeObserver 替代 addEventListener resize，并且使用 resize-observer-polyfill 向下兼容
- fix: 如果原始数据没有aspect，layoutGeometry将使用宽高计算
- feat: add rowHeight prop —— 横向瀑布流的行高
- feat: 当 props.columnWidth 和 props.rowHeight 改变时重新布局
