# 1.0.1-beta.9
- 使用 ResizeObserver 替代 addEventListener resize，并且使用 resize-observer-polyfill 向下兼容
- fix: 如果原始数据没有aspect，layoutGeometry将使用宽高计算
