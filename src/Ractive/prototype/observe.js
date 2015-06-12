import runloop from 'global/runloop';
import { isObject } from 'utils/is';
import { normalise } from 'shared/keypaths';

export function observe ( keypath, callback, options ) {
	const viewmodel = this.viewmodel;

	let observers = [];

	if ( isObject( keypath ) ) {
		const map = keypath;
		options = callback || {};

		Object.keys( map ).forEach( keypath => {
			const callback = map[ keypath ];

			keypath.split( ' ' ).forEach( keypath => {
				const model = viewmodel.join( normalise( keypath ).split( '.' ) ); // should have a splitKeypath function
				observers.push( new Observer( this, model, callback, options ) );
			});
		});
	}

	else {
		let keypaths;

		if ( typeof keypath === 'function' ) {
			options = callback;
			callback = keypath;
			keypaths = [ '' ];
		} else {
			keypaths = keypath.split( ' ' ).map( normalise );
		}

		keypaths.forEach( keypath => {
			const model = viewmodel.join( keypath.split( '.' ) );
			observers.push( new Observer( this, model, callback, options || {} ) );
		});
	}

	return {
		cancel () {
			observers.forEach( observer => observer.cancel() );
		}
	};
}

class Observer {
	constructor ( context, model, callback, options ) {
		this.context = context;
		this.model = model;
		this.keypath = model.getKeypath();
		this.callback = callback;

		this.oldValue = undefined;
		this.newValue = model.value;

		this.defer = options.defer;
		this.strict = options.strict;

		this.dirty = false;

		if ( options.init !== false ) {
			this.dispatch();
		} else {
			this.oldValue = model.value;
		}

		model.register( this );
	}

	handleChange () {
		if ( !this.dirty ) {
			this.newValue = this.model.value;

			if ( this.strict && this.newValue === this.oldValue ) return;

			runloop.addObserver( this, this.defer );
			this.dirty = true;
		}
	}

	dispatch () {
		this.callback.call( this.context, this.newValue, this.oldValue, this.keypath );
		this.oldValue = this.newValue;
		this.dirty = false;
	}
}
