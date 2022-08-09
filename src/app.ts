import React, { Component } from 'react'
import './app.less'

interface Props {
  children: React.ReactNode
}

class App extends Component<Props> {

  componentDidMount () {}

  componentDidShow () {}

  componentDidHide () {}

  // this.props.children 是将要会渲染的页面
  render () {
    return this.props.children
  }
}

export default App
