export default class Cache<T extends object> {
  map: WeakMap<T, number>

  constructor() {
    this.map = new WeakMap()
  }

  get(key: T) {
    return this.map.get(key)
  }

  has(key: T): boolean {
    return this.map.has(key)
  }

  set(key: T, value: any): void {
    this.map.set(key, value)
  }

  reset(): void {
    this.map = new WeakMap()
  }
}
