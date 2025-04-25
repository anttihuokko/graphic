type FieldMeta = { exists: boolean; value: unknown }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Func = (...args: any[]) => void | boolean | number | string | object

interface DebouncedFunc<T extends Func> {
  (...args: Parameters<T>): ReturnType<T>
  cancel(): void
  flush(): ReturnType<T>
}

export class Util {
  private static idCounter = 0

  static findMappedValue<T, V>(array: Array<T>, cb: (item: T, index: number) => V | undefined): V | undefined {
    for (let i = 0; i < array.length; i++) {
      const result = cb(array[i], i)
      if (result) {
        return result
      }
    }
    return undefined
  }

  static throttle<T extends Func>(func: T, wait: number): DebouncedFunc<T> {
    let currentArgs: Parameters<T>
    let currentContext: unknown
    let previousExcuteTime: number = 0
    let previousResult: ReturnType<T>
    let currentTimeoutHandle: ReturnType<typeof setTimeout> | null = null

    const cancelTimout = (): void => {
      if (currentTimeoutHandle) {
        clearInterval(currentTimeoutHandle)
        currentTimeoutHandle = null
      }
    }

    const execute = (): void => {
      cancelTimout()
      previousExcuteTime = Date.now()
      previousResult = func.apply(currentContext, currentArgs) as ReturnType<T>
    }

    const throttledFunction = function (this: unknown, ...args: Parameters<T>): ReturnType<T> {
      currentArgs = args
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      currentContext = this
      if (!currentTimeoutHandle) {
        const requiredWaitTime = wait - (Date.now() - previousExcuteTime)
        if (requiredWaitTime > 0) {
          currentTimeoutHandle = setTimeout(() => {
            execute()
          }, requiredWaitTime)
        } else {
          execute()
        }
      }
      return previousResult
    }

    throttledFunction['cancel'] = cancelTimout
    throttledFunction['flush'] = () => {
      if (currentTimeoutHandle) {
        execute()
      }
      return previousResult
    }

    return throttledFunction
  }

  static uniqueId(prefix?: string): string {
    return `${prefix ?? ''}${++Util.idCounter}`
  }

  static first<T>(array: ArrayLike<T>): T | undefined {
    return array[0]
  }

  static last<T>(array: ArrayLike<T>): T | undefined {
    return array[array.length - 1]
  }

  static pull<T>(array: T[], ...values: T[]): T[] {
    for (const value of values) {
      let index = 0
      while (index >= 0) {
        index = array.indexOf(value, index)
        if (index >= 0) {
          array.splice(index, 1)
        }
      }
    }
    return array
  }

  static minBy<T, V>(array: T[], mapper: (value: T) => V): T | undefined {
    if (array.length === 0) {
      return undefined
    }
    return array.reduce((previos, current) => (mapper(previos) < mapper(current) ? previos : current))
  }

  static maxBy<T, V>(array: T[], mapper: (value: T) => V): T | undefined {
    if (array.length === 0) {
      return undefined
    }
    return array.reduce((previos, current) => (mapper(previos) > mapper(current) ? previos : current))
  }

  static sortBy<T, V>(array: T[], mapper: (value: T) => V, asc: boolean = true): T[] {
    return array.sort((a, b) => {
      const v1 = mapper(a)
      const v2 = mapper(b)
      if (v1 < v2) {
        return asc ? -1 : 1
      }
      if (v1 > v2) {
        return asc ? 1 : -1
      }
      return 0
    })
  }

  static uniqBy<T, V>(array: T[], mapper: (value: T) => V): T[] {
    const result: T[] = []
    const addedValues = new Set<V>()
    for (const item of array) {
      const value = mapper(item)
      if (!addedValues.has(value)) {
        result.push(item)
        addedValues.add(value)
      }
    }
    return result
  }

  static hasValue<T>(path: string | string[], object: T): boolean {
    return Util.queryFieldMeta(Util.resolveFieldAccessors(path), object).exists
  }

  static getValue<T>(path: string | string[], object: T, defaultValue?: unknown): unknown {
    const meta = Util.queryFieldMeta(Util.resolveFieldAccessors(path), object)
    return meta.exists ? meta.value : defaultValue
  }

  private static resolveFieldAccessors(path: string | string[]): string[] {
    const segments = typeof path === 'string' ? [path] : path
    return segments.flatMap((segment) => segment.split('.'))
  }

  private static queryFieldMeta(accessors: string[], object: unknown): FieldMeta {
    const meta = Util.getFieldMeta(accessors[0], object)
    const remainingAccessors = accessors.slice(1)
    if (!meta.exists || remainingAccessors.length === 0) {
      return meta
    }
    return Util.queryFieldMeta(remainingAccessors, meta.value)
  }

  private static getFieldMeta(accessor: string, object: unknown): FieldMeta {
    const arrayAccessorMatch = accessor.match(/^(.+)\[(\d+)\]$/)
    const fieldName = arrayAccessorMatch ? arrayAccessorMatch[1] : accessor
    const index = arrayAccessorMatch ? Number(arrayAccessorMatch[2]) : -1
    if (object !== null && object !== undefined && typeof object === 'object' && fieldName in object) {
      const fieldValue = object[fieldName as keyof typeof object] as unknown
      if (index > -1) {
        return Array.isArray(fieldValue) && fieldValue.length >= index + 1
          ? { exists: true, value: fieldValue[index] as unknown }
          : { exists: false, value: undefined }
      }
      return { exists: true, value: fieldValue }
    }
    return { exists: false, value: undefined }
  }
}
