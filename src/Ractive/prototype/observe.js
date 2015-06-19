import runloop from 'global/runloop';
import { isEqual, isObject } from 'utils/is';
import { splitKeypath } from 'shared/keypaths';
import { cancel } from 'shared/methodCallers';
import { extend } from 'utils/object';
import ReferenceResolver from 'virtualdom/resolvers/ReferenceResolver';

const onceOptions = { init: false, once: true };

export function observe ( keypath, callback, options ) {
	let observers = [];

	if ( isObject( keypath ) ) {
		const map = keypath;
		options = callback || {};

		Object.keys( map ).forEach( keypath => {
			const callback = map[ keypath ];

			keypath.split( ' ' ).forEach( keypath => {
				observers.push( createObserver( this, keypath, callback, options ) );
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
			keypaths = keypath.split( ' ' );
		}

		keypaths.forEach( keypath => {
			observers.push( createObserver( this, keypath, callback, options || {} ) );
		});
	}

	// add observers to the Ractive instance, so they can be
	// cancelled on ractive.teardown()
	this._observers.push.apply( this._observers, observers );

	return {
		cancel () {
			observers.forEach( cancel );
		}
	};
}

export function observeOnce ( keypath, callback, options ) {
	if ( isObject( keypath ) || typeof keypath === 'function' ) {
		options = extend( callback || {}, onceOptions );
		return this.observe( keypath, options );
	}

	options = extend( options || {}, onceOptions );
	return this.observe( keypath, callback, options );
}

function createObserver ( ractive, keypath, callback, options ) {
	const viewmodel = ractive.viewmodel;

	const keys = splitKeypath( keypath );
	const wildcardIndex = keys.indexOf( '*' );

	// normal keypath - no wildcards
	if ( !~wildcardIndex ) {
		const key = keys[0];

		if ( !viewmodel.has( key ) ) {
			// if this is an inline component, we may need to create an implicit mapping
			if ( ractive.component ) {
				const resolver = new ReferenceResolver( ractive.component.parentFragment, key, model => {
					viewmodel.map( key, model );
				});

				// TODO can we just not bind in the first place?
				resolver.unbind();
			}
		}

		const model = viewmodel.join( keys );
		return new Observer( ractive, model, callback, options );
	}

	// pattern observers - more complex case
	const baseModel = wildcardIndex === 0 ?
		viewmodel :
		viewmodel.join( keys.slice( 0, wildcardIndex ) );

	return new PatternObserver( ractive, baseModel, keys.splice( wildcardIndex ), callback, options );
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
		this.once = options.once;
		this.strict = options.strict;

		this.dirty = false;

		if ( options.init !== false ) {
			this.dispatch();
		} else {
			this.oldValue = model.value;
		}

		model.register( this );
	}

	cancel () {
		this.model.unregister( this );
	}

	dispatch () {
		this.callback.call( this.context, this.newValue, this.oldValue, this.keypath );
		this.oldValue = this.newValue;
		this.dirty = false;
	}

	handleChange () {
		if ( !this.dirty ) {
			this.newValue = this.model.value;

			if ( this.strict && this.newValue === this.oldValue ) return;

			runloop.addObserver( this, this.defer );
			this.dirty = true;

			if ( this.once ) this.cancel();
		}
	}
}

class PatternObserver {
	constructor ( context, baseModel, keys, callback, options ) {
		this.context = context;
		this.baseModel = baseModel;
		this.keys = keys;
		this.callback = callback;

		const pattern = keys.join( '\\.' ).replace( /\*/g, '(.+)' );
		const baseKeypath = baseModel.getKeypath();
		this.pattern = new RegExp( `^${baseKeypath ? baseKeypath + '.' : ''}${pattern}$` );

		this.oldValues = {};
		this.newValues = {};

		this.defer = options.defer;
		this.once = options.once;
		this.strict = options.strict;

		this.dirty = false;

		this.baseModel.findMatches( this.keys ).forEach( model => {
			this.newValues[ model.getKeypath() ] = model.value;
		});

		if ( options.init !== false ) {
			this.dispatch();
		} else {
			this.oldValues = this.newValues;
		}

		baseModel.register( this );
	}

	cancel () {
		this.baseModel.unregister( this );
	}

	dispatch () {
		Object.keys( this.newValues ).forEach( keypath => {
			const newValue = this.newValues[ keypath ];
			const oldValue = this.oldValues[ keypath ];

			if ( this.strict && newValue === oldValue ) return;
			if ( isEqual( newValue, oldValue ) ) return;

			const wildcards = this.pattern.exec( keypath ).slice( 1 );
			const args = [ newValue, oldValue, keypath ].concat( wildcards );

			this.callback.apply( this.context, args );
		});

		this.oldValues = this.newValues;
		this.dirty = false;
	}

	handleChange () {
		if ( !this.dirty ) {
			this.newValues = {};

			// handle case where previously extant keypath no longer exists -
			// observer should still fire, with undefined as new value
			// TODO huh. according to the test suite that's not the case...
			// Object.keys( this.oldValues ).forEach( keypath => {
			// 	this.newValues[ keypath ] = undefined;
			// });

			this.baseModel.findMatches( this.keys ).forEach( model => {
				const keypath = model.getKeypath();
				this.newValues[ keypath ] = model.value;
			});

			runloop.addObserver( this, this.defer );
			this.dirty = true;

			if ( this.once ) this.cancel();
		}
	}
}
