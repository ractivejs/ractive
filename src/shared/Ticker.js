import { warnOnce } from 'utils/log';
import { missingPlugin } from 'config/errors';
import getTime from 'utils/getTime';
import animations from 'shared/animations';

// TODO what happens if a transition is aborted?
// TODO use this with Animation to dedupe some code?

var Ticker = function ( options ) {
	var easing;

	this.duration = options.duration;
	this.step = options.step;
	this.complete = options.complete;

	// easing
	if ( typeof options.easing === 'string' ) {
		easing = options.root.easing[ options.easing ];

		if ( !easing ) {
			warnOnce( missingPlugin( options.easing, 'easing' ) );
			easing = linear;
		}
	} else if ( typeof options.easing === 'function' ) {
		easing = options.easing;
	} else {
		easing = linear;
	}

	this.easing = easing;

	this.start = getTime();
	this.end = this.start + this.duration;

	this.running = true;
	animations.add( this );
};

Ticker.prototype = {
	tick: function ( now ) {
		var elapsed, eased;

		if ( !this.running ) {
			return false;
		}

		if ( now > this.end ) {
			if ( this.step ) {
				this.step( 1 );
			}

			if ( this.complete ) {
				this.complete( 1 );
			}

			return false;
		}

		elapsed = now - this.start;
		eased = this.easing( elapsed / this.duration );

		if ( this.step ) {
			this.step( eased );
		}

		return true;
	},

	stop: function () {
		if ( this.abort ) {
			this.abort();
		}

		this.running = false;
	}
};

export default Ticker;
function linear ( t ) { return t; }
