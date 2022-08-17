import { Component, ReactNode } from 'react'
interface Props {
  children: ReactNode
}
// import 'taro-picker-cascader/index.css'

class App extends Component<Props> {
  render() {
    return this.props.children
  }
}

export default App
