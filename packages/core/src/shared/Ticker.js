import runloop from '../global/runloop';

// TODO what happens if a transition is aborted?

const tickers = [];
let running = false;

function tick () {
	runloop.start();

	const now = performance.now();

	let i;
	let ticker;

	for ( i = 0; i < tickers.length; i += 1 ) {
		ticker = tickers[i];

		if ( !ticker.tick( now ) ) {
			// ticker is complete, remove it from the stack, and decrement i so we don't miss one
			tickers.splice( i--, 1 );
		}
	}

	runloop.end();

	if ( tickers.length ) {
		requestAnimationFrame( tick );
	} else {
		running = false;
	}
}

export default class Ticker {
	constructor ( options ) {
		this.duration = options.duration;
		this.step = options.step;
		this.complete = options.complete;
		this.easing = options.easing;

		this.start = performance.now();
		this.end = this.start + this.duration;

		this.running = true;

		tickers.push( this );
		if ( !running ) requestAnimationFrame( tick );
	}

	tick ( now ) {
		if ( !this.running ) return false;

		if ( now > this.end ) {
			if ( this.step ) this.step( 1 );
			if ( this.complete ) this.complete( 1 );

			return false;
		}

		const elapsed = now - this.start;
		const eased = this.easing( elapsed / this.duration );

		if ( this.step ) this.step( eased );

		return true;
	}

	stop () {
		if ( this.abort ) this.abort();
		this.running = false;
	}
}
