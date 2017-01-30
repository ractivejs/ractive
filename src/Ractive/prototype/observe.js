import runloop from '../../global/runloop';
import { isEqual, isObject } from '../../utils/is';
import { splitKeypath, escapeKey } from '../../shared/keypaths';
import { removeFromArray } from '../../utils/array';
import resolveReference from '../../view/resolvers/resolveReference';
import { rebindMatch } from '../../shared/rebind';

export default function observe ( keypath, callback, options ) {
	const observers = [];
	let map;

	if ( isObject( keypath ) ) {
		map = keypath;
		options = callback || {};
	} else {
		if ( typeof keypath === 'function' ) {
			map = { '': keypath };
			options = callback;
		} else {
			map = {};
			map[ keypath ] = callback;
		}
	}

	let silent = false;
	Object.keys( map ).forEach( keypath => {
		const callback = map[ keypath ];
		const caller = function ( ...args ) {
			if ( silent ) return;
			return callback.apply( this, args );
		};

		let keypaths = keypath.split( ' ' );
		if ( keypaths.length > 1 ) keypaths = keypaths.filter( k => k );

		keypaths.forEach( keypath => {
			observers.push( createObserver( this, keypath, caller, options || {} ) );
		});
	});

	// add observers to the Ractive instance, so they can be
	// cancelled on ractive.teardown()
	this._observers.push.apply( this._observers, observers );

	return {
		cancel: () => observers.forEach( o => o.cancel() ),
		isSilenced: () => silent,
		silence: () => silent = true,
		resume: () => silent = false
	};
}

function createObserver ( ractive, keypath, callback, options ) {
	const keys = splitKeypath( keypath );
	let wildcardIndex = keys.indexOf( '*' );
	options.keypath = keypath;
	options.fragment = options.fragment || ractive.fragment;

	let model;
	if ( !options.fragment ) {
		model = ractive.viewmodel.joinKey( keys[0] );
	} else {
		// .*.whatever relative wildcard is a special case because splitkeypath doesn't handle the leading .
		if ( keys[0] === '.*' ) {
			model = options.fragment.findContext();
			wildcardIndex = 0;
			keys[0] = '*';
		} else {
			model = wildcardIndex === 0 ? options.fragment.findContext() : resolveReference( options.fragment, keys[0] );
		}
	}

	// the model may not exist key
	if ( !model ) model = ractive.viewmodel.joinKey( keys[0] );

	if ( !~wildcardIndex ) {
		model = model.joinAll( keys.slice( 1 ) );
		return new Observer( ractive, model, callback, options );
	} else {
		model = model.joinAll( keys.slice( 1, wildcardIndex ) );
		return new PatternObserver( ractive, model, keys.slice( wildcardIndex ), callback, options );
	}
}

class Observer {
	constructor ( ractive, model, callback, options ) {
		this.context = options.context || ractive;
		this.callback = callback;
		this.ractive = ractive;

		this.resolved( model );

		if ( options.init !== false ) {
			this.dirty = true;
			this.dispatch();
		} else {
			this.oldValue = this.newValue;
		}

		this.defer = options.defer;
		this.once = options.once;
		this.strict = options.strict;

		this.dirty = false;
	}

	cancel () {
		this.cancelled = true;
		if ( this.model ) {
			this.model.unregister( this );
		}
		removeFromArray( this.ractive._observers, this );
	}

	dispatch () {
		if ( !this.cancelled ) {
			this.callback.call( this.context, this.newValue, this.oldValue, this.keypath );
			this.oldValue = this.model ? this.model.get() : this.newValue;
			this.dirty = false;
		}
	}

	handleChange () {
		if ( !this.dirty ) {
			const newValue = this.model.get();
			if ( isEqual( newValue, this.oldValue ) ) return;

			this.newValue = newValue;

			if ( this.strict && this.newValue === this.oldValue ) return;

			runloop.addObserver( this, this.defer );
			this.dirty = true;

			if ( this.once ) runloop.scheduleTask( () => this.cancel() );
		}
	}

	rebind ( next, previous ) {
		next = rebindMatch( this.keypath, next, previous );
		if ( next === this.model ) return false;

		if ( this.model ) this.model.unregister( this );
		if ( next ) next.addShuffleTask( () => this.resolved( next ) );
	}

	resolved ( model ) {
		this.model = model;
		this.keypath = model.getKeypath( this.ractive );

		this.oldValue = undefined;
		this.newValue = model.get();

		model.register( this );
	}
}

class PatternObserver {
	constructor ( ractive, baseModel, keys, callback, options ) {
		this.context = options.context || ractive;
		this.ractive = ractive;
		this.baseModel = baseModel;
		this.keys = keys;
		this.callback = callback;

		const pattern = keys.join( '\\.' ).replace( /\*/g, '(.+)' );
		const baseKeypath = baseModel.getKeypath( ractive );
		this.pattern = new RegExp( `^${baseKeypath ? baseKeypath + '\\.' : ''}${pattern}$` );

		this.oldValues = {};
		this.newValues = {};

		this.defer = options.defer;
		this.once = options.once;
		this.strict = options.strict;

		this.dirty = false;
		this.changed = [];
		this.partial = false;

		const models = baseModel.findMatches( this.keys );

		models.forEach( model => {
			this.newValues[ model.getKeypath( this.ractive ) ] = model.get();
		});

		if ( options.init !== false ) {
			this.dispatch();
		} else {
			this.oldValues = this.newValues;
		}

		baseModel.registerPatternObserver( this );
	}

	cancel () {
		this.baseModel.unregisterPatternObserver( this );
		removeFromArray( this.ractive._observers, this );
	}

	dispatch () {
		const newValues = this.newValues;
		this.newValues = {};
		Object.keys( newValues ).forEach( keypath => {
			if ( this.newKeys && !this.newKeys[ keypath ] ) return;

			const newValue = newValues[ keypath ];
			const oldValue = this.oldValues[ keypath ];

			if ( this.strict && newValue === oldValue ) return;
			if ( isEqual( newValue, oldValue ) ) return;

			let args = [ newValue, oldValue, keypath ];
			if ( keypath ) {
				const wildcards = this.pattern.exec( keypath );
				if ( wildcards ) {
					args = args.concat( wildcards.slice( 1 ) );
				}
			}

			this.callback.apply( this.context, args );
		});

		if ( this.partial ) {
			for ( const k in newValues ) {
				this.oldValues[k] = newValues[k];
			}
		} else {
			this.oldValues = newValues;
		}

		this.newKeys = null;
		this.dirty = false;
	}

	notify ( key ) {
		this.changed.push( key );
	}

	shuffle ( newIndices ) {
		if ( !Array.isArray( this.baseModel.value ) ) return;

		const base = this.baseModel.getKeypath( this.ractive );
		const max = this.baseModel.value.length;
		const suffix = this.keys.length > 1 ? '.' + this.keys.slice( 1 ).join( '.' ) : '';

		this.newKeys = {};
		for ( let i = 0; i < newIndices.length; i++ ) {
			if ( newIndices[ i ] === -1 || newIndices[ i ] === i ) continue;
			this.newKeys[ `${base}.${i}${suffix}` ] = true;
		}

		for ( let i = newIndices.touchedFrom; i < max; i++ ) {
			this.newKeys[ `${base}.${i}${suffix}` ] = true;
		}
	}

	handleChange () {
		if ( !this.dirty || this.changed.length ) {
			if ( !this.dirty ) this.newValues = {};

			// handle case where previously extant keypath no longer exists -
			// observer should still fire, with undefined as new value
			// TODO huh. according to the test suite that's not the case...
			// NOTE: I don't think this will work with partial updates
			// Object.keys( this.oldValues ).forEach( keypath => {
			// 	this.newValues[ keypath ] = undefined;
			// });

			if ( !this.changed.length ) {
				this.baseModel.findMatches( this.keys ).forEach( model => {
					const keypath = model.getKeypath( this.ractive );
					this.newValues[ keypath ] = model.get();
				});
				this.partial = false;
			} else {
				let count = 0;
				const ok = this.baseModel.isRoot ?
					this.changed.map( keys => keys.map( escapeKey ).join( '.' ) ) :
					this.changed.map( keys => this.baseModel.getKeypath( this.ractive ) + '.' + keys.map( escapeKey ).join( '.' ) );

				this.baseModel.findMatches( this.keys ).forEach( model => {
					const keypath = model.getKeypath( this.ractive );
					const check = k => {
						return ( k.indexOf( keypath ) === 0 && ( k.length === keypath.length || k[ keypath.length ] === '.' ) ) ||
							   ( keypath.indexOf( k ) === 0 && ( k.length === keypath.length || keypath[ k.length ] === '.' ) );

					};

					// is this model on a changed keypath?
					if ( ok.filter( check ).length ) {
						count++;
						this.newValues[ keypath ] = model.get();
					}
				});

				// no valid change triggered, so bail to avoid breakage
				if ( !count ) return;

				this.partial = true;
			}

			runloop.addObserver( this, this.defer );
			this.dirty = true;
			this.changed.length = 0;

			if ( this.once ) this.cancel();
		}
	}
}
