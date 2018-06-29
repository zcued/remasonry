import * as React from 'react'

interface Props {
  containerHeight: number
  isAtEnd?: boolean
  isFetching: boolean
  fetchMore?: Function
  scrollHeight: number
  scrollTop: number
}

export default class FetchItems extends React.PureComponent<Props> {
  componentDidMount() {
    setTimeout(this.check)
  }

  componentDidUpdate() {
    this.check()
  }

  check = () => {
    const { isAtEnd, isFetching, fetchMore, scrollHeight, scrollTop } = this.props

    if (isAtEnd || isFetching || !fetchMore) {
      return
    }

    if (scrollTop > scrollHeight) {
      fetchMore()
    }
  }

  render() {
    return null
  }
}
