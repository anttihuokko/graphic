import { Util } from './Util'

export class NativeResizeObserver {
  private readonly handleResizeThrottled = Util.throttle(this.onResize, 400)

  private resizeObserver: ResizeObserver | null = null

  constructor(
    private readonly element: HTMLElement,
    private readonly onResize: () => void
  ) {}

  enable(): void {
    if (!this.resizeObserver) {
      this.resizeObserver = new ResizeObserver(() => this.handleResizeThrottled())
      this.resizeObserver.observe(this.element)
    }
  }

  disable() {
    this.resizeObserver?.disconnect()
  }
}

export class PollingResizeObserver {
  private readonly handleResizeThrottled = Util.throttle(this.handleResize.bind(this), 400)

  private width: number = 0

  private height: number = 0

  private pollHandle: NodeJS.Timeout | null = null

  constructor(
    private readonly element: HTMLElement,
    private readonly onResize: () => void
  ) {
    this.setDimensions()
    this.enable()
  }

  enable(): void {
    if (!this.pollHandle) {
      window.addEventListener('resize', this.handleResizeThrottled)
      this.pollHandle = setInterval(() => {
        if (this.width !== this.element.clientWidth || this.height !== this.element.clientHeight) {
          this.handleResizeThrottled()
        }
      }, 400)
    }
  }

  disable(): void {
    if (this.pollHandle) {
      window.removeEventListener('resize', this.handleResizeThrottled)
      clearTimeout(this.pollHandle)
      this.pollHandle = null
    }
  }

  private handleResize(): void {
    this.setDimensions()
    this.onResize()
  }

  private setDimensions(): void {
    this.width = this.element.clientWidth
    this.height = this.element.clientHeight
  }
}
