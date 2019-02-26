import * as React from 'react'

interface Props {
  containerHeight: number
  isAtEnd?: boolean
  isFetching: boolean
  fetchMore?: Function
  scrollHeight: number
  scrollTop: number
  customScrollBuffer?: number
}

export default class FetchItems extends React.PureComponent<Props> {
  componentDidMount() {
    setTimeout(this.check)
  }

  componentDidUpdate() {
    this.check()
  }

  check = () => {
    const {
      containerHeight,
      isAtEnd,
      isFetching,
      fetchMore,
      scrollHeight,
      scrollTop,
      customScrollBuffer
    } = this.props

    if (isAtEnd || isFetching || !fetchMore) {
      return
    }

    const scrollBuffer = customScrollBuffer || containerHeight * 3

    if (scrollTop + scrollBuffer > scrollHeight) {
      fetchMore()
    }
  }

  render() {
    return null
  }
}
