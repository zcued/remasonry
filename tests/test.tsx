import React from 'react'
import { cleanup, render } from '@testing-library/react'
import Masonry from '../src/index'

afterEach(() => {
  cleanup()
})

const items = []

for (let index = 0; index < 100; index++) {
  items[index] = {
    title: Math.random()
      .toString(36)
      .substr(2)
  }
}

it('should render Masonry with correct DOM structure', () => {
  const { container, debug, getByTestId } = render(
    <Masonry
      items={items}
      renderItem={({ itemIdx }) => (
        <div
          data-testid={`Masonry-${itemIdx}`}
          key={itemIdx}
          style={{
            width: 264,
            height: itemIdx % 2 === 0 ? 264 * 1.5 : 264
          }}
        />
      )}
    />
  )
})
