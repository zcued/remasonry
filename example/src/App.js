import React, { Component } from 'react'
import Remasonry from 'remasonry'

const items = []

for (let index = 0; index < 100; index++) {
  items[index] = {
    title: Math.random()
      .toString(36)
      .substr(2)
  }
}

class App extends Component {
  renderItem = ({ data, itemIdx }) => {
    return (
      <div
        className="marsonry-item"
        key={itemIdx}
        style={{
          width: 264,
          height: itemIdx % 2 === 0 ? 264 * 1.5 : 264
        }}
      >
        {data.title}
      </div>
    )
  }

  render() {
    return <Remasonry items={items} scrollContainer={() => window} renderItem={this.renderItem} />
  }
}

export default App
