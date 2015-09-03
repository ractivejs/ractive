import { warnOnceIfDebug } from '../utils/log';
import { missingPlugin } from '../config/errors';
import getTime from '../utils/getTime';
import animations from './animations';

// TODO what happens if a transition is aborted?
// TODO use this with Animation to dedupe some code?

export default class Ticker {
	constructor ( options ) {
		this.duration = options.duration;
		this.step = options.step;
		this.complete = options.complete;
		this.easing = options.easing;

		this.start = getTime();
		this.end = this.start + this.duration;

		this.running = true;
		animations.add( this );
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
