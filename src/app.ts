import React, { Component } from 'react'

interface Props {
  children: React.ReactNode
}

class App extends Component<Props> {

  render () {
    return this.props.children
  }
}

export default App
