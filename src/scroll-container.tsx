import * as React from 'react'

interface Props {
  children?: any
  onScroll: Function
  scrollContainer: HTMLElement | Function
}

function getScrollContainer(scrollContainer: Function | HTMLElement) {
  return typeof scrollContainer === 'function' ? scrollContainer() : scrollContainer
}

export default class ScrollContainer extends React.Component<Props> {
  scrollContainer: HTMLElement

  componentDidMount() {
    const scrollContainer = getScrollContainer(this.props.scrollContainer)
    if (!scrollContainer) {
      return
    }
    this.updateScrollContainer(scrollContainer)
  }

  componentWillReceiveProps(nextProps: Props) {
    const nextScrollContainer = getScrollContainer(nextProps.scrollContainer)
    if (!nextScrollContainer || nextScrollContainer === this.scrollContainer) {
      return
    }
    this.updateScrollContainer(nextScrollContainer)
  }

  componentWillUnmount() {
    if (this.scrollContainer) {
      this.scrollContainer.removeEventListener('scroll', this.handleScroll)
    }
  }

  getScrollContainerRef = () => this.scrollContainer

  updateScrollContainer(scrollContainer: HTMLElement) {
    if (this.scrollContainer) {
      // cleanup existing scroll container if it exists
      this.scrollContainer.removeEventListener('scroll', this.handleScroll)
    }

    this.scrollContainer = scrollContainer
    this.scrollContainer.addEventListener('scroll', this.handleScroll)
  }

  handleScroll = (event: Event) => {
    this.props.onScroll(event)
  }

  render() {
    return React.Children.only(this.props.children)
  }
}
