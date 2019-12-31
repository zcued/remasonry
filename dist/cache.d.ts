export default class Cache<T extends object> {
  map: WeakMap<T, number>
  constructor()
  get(key: T): number
  has(key: T): boolean
  set(key: T, value: any): void
  reset(): void
}
