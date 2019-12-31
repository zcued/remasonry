export interface F {
  (): () => void
  cancel: () => void
}
export declare const throttle: (fn: () => void, wait?: number) => F
export declare const debounce: (fn: () => void, ms?: number) => F
export declare function getElementHeight(element: HTMLElement | Window): number
export declare function getWindowScrollPos(): number
export declare function getRelativeScrollTop(element: HTMLElement | Window): number
export declare function getScrollHeight(element: HTMLElement | Window): number
export declare function getScrollPos(element: HTMLElement | Window): number
