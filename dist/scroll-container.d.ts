import * as React from 'react'
interface Props {
  children?: any
  onScroll: Function
  scrollContainer: HTMLElement | Function
}
export default class ScrollContainer extends React.Component<Props> {
  scrollContainer: HTMLElement
  componentDidMount(): void
  componentWillReceiveProps(nextProps: Props): void
  componentWillUnmount(): void
  getScrollContainerRef: () => HTMLElement
  updateScrollContainer(scrollContainer: HTMLElement): void
  handleScroll: (event: Event) => void
  render(): any
}
export {}
