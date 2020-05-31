import runloop from 'src/global/runloop';
import { assign } from 'src/utils/object';
import { EasingFunction } from 'types/Easings';

// TODO what happens if a transition is aborted?

const tickers: Ticker[] = [];
let running = false;

function tick(): void {
  runloop.start();

  const now = performance.now();

  let ticker: Ticker;

  for (let i = 0; i < tickers.length; i += 1) {
    ticker = tickers[i];

    if (!ticker.tick(now)) {
      // ticker is complete, remove it from the stack, and decrement i so we don't miss one
      tickers.splice(i--, 1);
    }
  }

  runloop.end();

  if (tickers.length) {
    requestAnimationFrame(tick);
  } else {
    running = false;
  }
}

export interface TickerOptions {
  duration: number;
  easing: EasingFunction;
  step: (value: number) => void;
  complete: () => void;
}

export default class Ticker {
  private duration: number;
  private easing: EasingFunction;
  private step: (value: number) => void;
  private complete: (value: unknown) => void;

  private start: number;
  private end: number;

  private running: boolean;

  constructor(options: TickerOptions) {
    assign(this, options);

    this.start = performance.now();
    this.end = this.start + this.duration;

    this.running = true;

    tickers.push(this);
    if (!running) requestAnimationFrame(tick);
  }

  tick(now: number): boolean {
    if (!this.running) return false;

    if (now > this.end) {
      if (this.step) this.step(1);
      if (this.complete) this.complete(1);

      return false;
    }

    const elapsed = now - this.start;
    const eased = this.easing(elapsed / this.duration);

    if (this.step) this.step(eased);

    return true;
  }

  stop(): void {
    // if (this.abort) this.abort();
    this.running = false;
  }
}
