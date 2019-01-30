/**
 * @class BottomScrollListener
 *
 * A simple React component that lets you listen for when you have scrolled to the bottom.
 *
 */

// @ts-ignore
import debounce from 'lodash.debounce'
import * as React from 'react'

export type Props = {
  /** Required callback that will be invoked when scrolled to bottom */
  onBottom: () => void

  /** Optional debounce in milliseconds, defaults to 200ms */
  debounce: number

  /** Offset from bottom of page in pixels. E.g. 300 will trigger onBottom 300px from the bottom of the page */
  offset: number

  /**
   *   Optional children to be rendered.
   *
   *   If children passed is a function, that function will be passed a React.RefObject<HTMLElement>
   *   that ref shall be passed to a child tag that will be used for the scrolling container.
   * */
  children?: React.ReactNode | ((ref: React.RefObject<HTMLElement>) => React.ReactNode)
  
  scrollContainerRef?: any
}

class BottomScrollListener extends React.Component<Props> {
  public static defaultProps = {
    debounce: 200,
    offset: 0,
  }

  optionalScrollContainerRef: React.RefObject<HTMLElement> = React.createRef()
  domElement: HTMLElement

  constructor(props: Props) {
    super(props)

    if (props.debounce) {
      this.handleOnScroll = debounce(this.handleOnScroll.bind(this), props.debounce, { trailing: true })
    } else {
      this.handleOnScroll = this.handleOnScroll.bind(this)
    }
  }

  componentDidMount() {
    if (this.props.children instanceof Function || this.props.scrollContainerRef.current) {
      this.domElement = this.optionalScrollContainerRef.current || this.props.scrollContainerRef.current;
      
      if (this.domElement) {
        this.domElement.addEventListener('scroll', this.handleOnScroll)
      } else {
        throw Error(
          'Unable to use scroll container: Ref to child not available, did you pass the ref prop to an element?',
        )
      }
    } else {
      document.addEventListener('scroll', this.handleOnScroll)
    }
  }

  componentWillUnmount() {
    if (this.props.children instanceof Function || this.props.scrollContainerRef.current) {
      if (this.domElement) {
        this.domElement.removeEventListener('scroll', this.handleOnScroll)
      } else {
        throw Error('Unable to clean up scroll container: Ref has been unmounted prematurely.')
      }
    } else {
      document.removeEventListener('scroll', this.handleOnScroll)
    }
  }

  private handleOnScroll() {
    if (this.props.children instanceof Function) {
      const scrollNode = this.domElement

      if (
        scrollNode != null &&
        scrollNode.scrollHeight - this.props.offset <= scrollNode.scrollTop + scrollNode.clientHeight
      ) {
        this.props.onBottom()
      }
    } else {
      const scrollNode = document.scrollingElement || document.documentElement

      if (
        scrollNode != null &&
        scrollNode.scrollHeight - this.props.offset <= scrollNode.scrollTop + window.innerHeight
      ) {
        this.props.onBottom()
      }
    }
  }

  public render() {
    if (!this.props.children) return null

    if (this.props.children instanceof Function) {
      return this.props.children(this.optionalScrollContainerRef)
    } else {
      return this.props.children
    }
  }
}

export default BottomScrollListener
