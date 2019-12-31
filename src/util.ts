export interface F {
  (): () => void
  cancel: () => void
}

export const throttle = (fn: () => void, wait: number = 0): F => {
  let timer, lastTime, inThrottle

  const throttled: any = (...args) => {
    if (!inThrottle) {
      fn.apply(null, args)
      lastTime = Date.now()
      inThrottle = true
    } else {
      clearTimeout(timer)
      timer = setTimeout(function() {
        if (Date.now() - lastTime >= wait) {
          fn.apply(this, args)
          lastTime = Date.now()
        }
      }, wait - (Date.now() - lastTime))
    }
  }

  throttled.cancel = () => {
    if (timer) {
      clearTimeout(timer)
    }
  }

  return throttled
}

export const debounce = (fn: () => void, ms: number = 0): F => {
  let timer

  const debounced: any = (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), ms)
  }

  debounced.cancel = () => {
    if (timer) {
      clearTimeout(timer)
    }
  }

  return debounced
}

export function getElementHeight(element: HTMLElement | Window): number {
  if (element instanceof HTMLElement) {
    return element.clientHeight
  }
  return window.innerHeight
}

export function getWindowScrollPos() {
  if (window.scrollY !== undefined) {
    // Modern browser
    return window.scrollY
  } else if (document.documentElement && document.documentElement.scrollTop !== undefined) {
    // IE support.
    return document.documentElement.scrollTop
  }
  return 0
}

export function getRelativeScrollTop(element: HTMLElement | Window): number {
  if (element instanceof HTMLElement) {
    return element.scrollTop - element.getBoundingClientRect().top
  }
  return getWindowScrollPos()
}

export function getScrollHeight(element: HTMLElement | Window): number {
  if (element instanceof HTMLElement) {
    return element.scrollHeight
  }

  return (document.documentElement || document.body).scrollHeight
}

export function getScrollPos(element: HTMLElement | Window): number {
  if (element instanceof HTMLElement) {
    return element.scrollTop
  }
  return getWindowScrollPos()
}
