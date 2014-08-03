import warn from 'utils/warn';
import runloop from 'global/runloop';
import interpolate from 'shared/interpolate';

var Animation = function ( options ) {
	var key;

	this.startTime = Date.now();

	// from and to
	for ( key in options ) {
		if ( options.hasOwnProperty( key ) ) {
			this[ key ] = options[ key ];
		}
	}

	this.interpolator = interpolate( this.from, this.to, this.root, this.interpolator );
	this.running = true;

	this.tick();
};

Animation.prototype = {
	tick: function () {
		var elapsed, t, value, timeNow, index, keypath;

		keypath = this.keypath;

		if ( this.running ) {
			timeNow = Date.now();
			elapsed = timeNow - this.startTime;

			if ( elapsed >= this.duration ) {
				if ( keypath !== null ) {
					runloop.start( this.root );
					this.root.viewmodel.set( keypath, this.to );
					runloop.end();
				}

				if ( this.step ) {
					this.step( 1, this.to );
				}

				this.complete( this.to );

				index = this.root._animations.indexOf( this );

				// TODO investigate why this happens
				if ( index === -1 ) {
					warn( 'Animation was not found' );
				}

				this.root._animations.splice( index, 1 );

				this.running = false;
				return false; // remove from the stack
			}

			t = this.easing ? this.easing ( elapsed / this.duration ) : ( elapsed / this.duration );

			if ( keypath !== null ) {
				value = this.interpolator( t );
				runloop.start( this.root );
				this.root.viewmodel.set( keypath, value );
				runloop.end();
			}

			if ( this.step ) {
				this.step( t, value );
			}

			return true; // keep in the stack
		}

		return false; // remove from the stack
	},

	stop: function () {
		var index;

		this.running = false;

		index = this.root._animations.indexOf( this );

		// TODO investigate why this happens
		if ( index === -1 ) {
			warn( 'Animation was not found' );
		}

		this.root._animations.splice( index, 1 );
	}
};

export default Animation;
