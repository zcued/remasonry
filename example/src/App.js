import React, { Component } from 'react'
import Remasonry from 'remasonry'

const items = generateItems(200)

function generateItems(count) {
  let items = []
  for (let i = 0; i < count; i++) {
    items[i] = {
      aspect: 1,
      height: 100 + Math.random() * 100
    }
  }
  return items
}

class App extends Component {
  state = { isHorizontal: true }

  handleToggle = () => {
    this.setState({ isHorizontal: !this.state.isHorizontal })
  }

  renderHorizontalItem({ position, itemIdx }) {
    return (
      <div className="marsonry-item" key={itemIdx}>
        <div style={{ height: position ? position.height : 0 }} />
      </div>
    )
  }

  renderItem({ data, itemIdx }) {
    return (
      <div className="marsonry-item" key={itemIdx}>
        <div style={{ height: data.height }} />
      </div>
    )
  }

  render() {
    const { isHorizontal } = this.state

    return (
      <main>
        <p>Hello Masonry</p>
        <button onClick={this.handleToggle}>👉 Toggle 👈</button>
        <section>
          {isHorizontal ? (
            <Remasonry
              items={items}
              scrollContainer={() => window}
              layout="horizontal"
              renderItem={this.renderHorizontalItem}
            />
          ) : (
            <Remasonry items={items} scrollContainer={() => window} renderItem={this.renderItem} />
          )}
        </section>
      </main>
    )
  }
}

export default App
