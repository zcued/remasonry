import React, { Component } from 'react'
import Remasonry from 'remasonry'

const items = generateItems(15)

function generateItems(count) {
  let items = []
  for (let i = 0; i < count; i++) {
    items[i] = {
      aspect: 4 / (i + 1),
      height: 200
    }
  }
  return items
}

class App extends Component {
  state = { isHorizontal: true }

  handleToggle = () => {
    this.setState({ isHorizontal: !this.state.isHorizontal })
  }

  renderHorizontalItem({ itemIdx }) {
    return (
      <div className="marsonry-item" key={itemIdx}>
        {itemIdx}
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
              layout="horizontal"
              gutterWidth={8}
              maxNumRows={1}
              renderItem={this.renderHorizontalItem}
            />
          ) : (
            <Remasonry items={items} renderItem={this.renderItem} />
          )}
        </section>
      </main>
    )
  }
}

export default App
