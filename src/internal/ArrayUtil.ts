export class ArrayUtil {
  static findMappedValue<T, V>(array: Array<T>, cb: (item: T, index: number) => V | undefined): V | undefined {
    for (let i = 0; i < array.length; i++) {
      const result = cb(array[i], i)
      if (result) {
        return result
      }
    }
    return undefined
  }
}
