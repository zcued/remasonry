import * as React from 'react'
interface Props {
  containerHeight: number
  isFetching: boolean
  scrollHeight: number
  scrollTop: number
  isAtEnd?: boolean
  fetchMore?: Function
  customScrollBuffer?: number
}
export default class FetchItems extends React.PureComponent<Props> {
  componentDidMount(): void
  componentDidUpdate(): void
  check: () => void
  render(): any
}
export {}
