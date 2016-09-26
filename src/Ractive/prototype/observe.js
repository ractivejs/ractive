import runloop from '../../global/runloop';
import { isArray, isEqual, isObject } from '../../utils/is';
import { splitKeypath, escapeKey } from '../../shared/keypaths';
import { removeFromArray } from '../../utils/array';
import resolveReference from '../../view/resolvers/resolveReference';
import { rebindMatch } from '../../shared/rebind';
import ReferenceResolver from '../../view/resolvers/ReferenceResolver';

export default function observe ( keypath, callback, options ) {
	let observers = [];
	let map;

	if ( isObject( keypath ) ) {
		map = keypath;
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
		cancel: () => {
			observers.forEach( ( observer ) => {
				removeFromArray ( this._observers, observer );
				observer.cancel();
			} );
		}
	};
}

function createObserver ( ractive, keypath, callback, options ) {
	const viewmodel = ractive.viewmodel;

	const keys = splitKeypath( keypath );
	const wildcardIndex = keys.indexOf( '*' );
	options.keypath = keypath;

	// normal keypath - no wildcards
	if ( !~wildcardIndex ) {
		const key = keys[0];
		let model;

		// if not the root model itself, check if viewmodel has key.
		if ( key !== '' && !viewmodel.has( key ) ) {
			// if this is an inline component, we may need to create an implicit mapping
			if ( ractive.component && !ractive.isolated ) {
				model = resolveReference( ractive.component.parentFragment, key );
				if ( model ) {
					viewmodel.map( key, model );
					model = viewmodel.joinAll( keys );
				}
			}
		} else {
			model = viewmodel.joinAll( keys );
		}

		return new Observer( ractive, model, callback, options );
	}

	// pattern observers - more complex case
	const baseModel = wildcardIndex === 0 ?
		viewmodel :
		viewmodel.joinAll( keys.slice( 0, wildcardIndex ) );

	return new PatternObserver( ractive, baseModel, keys.splice( wildcardIndex ), callback, options );
}

class Observer {
	constructor ( ractive, model, callback, options ) {
		this.context = options.context || ractive;
		this.callback = callback;
		this.ractive = ractive;

		if ( model ) this.resolved( model );
		else {
			this.keypath = options.keypath;
			this.resolver = new ReferenceResolver( ractive.fragment, options.keypath, model => {
				this.resolved( model );
			});
		}

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
		} else {
			this.resolver.unbind();
		}
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

	rebinding ( next, previous ) {
		next = rebindMatch( this.keypath, next, previous );
		// TODO: set up a resolver if next is undefined?
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
	}

	dispatch () {
		Object.keys( this.newValues ).forEach( keypath => {
			if ( this.newKeys && !this.newKeys[ keypath ] ) return;

			const newValue = this.newValues[ keypath ];
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
			for ( const k in this.newValues ) {
				this.oldValues[k] = this.newValues[k];
			}
		} else {
			this.oldValues = this.newValues;
		}

		this.newKeys = null;
		this.dirty = false;
	}

	notify ( key ) {
		this.changed.push( key );
	}

	shuffle ( newIndices ) {
		if ( !isArray( this.baseModel.value ) ) return;

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
				const ok = this.baseModel.isRoot ?
					this.changed :
					this.changed.map( key => this.baseModel.getKeypath( this.ractive ) + '.' + escapeKey( key ) );

				this.baseModel.findMatches( this.keys ).forEach( model => {
					const keypath = model.getKeypath( this.ractive );
					// is this model on a changed keypath?
					if ( ok.filter( k => keypath.indexOf( k ) === 0 && ( keypath.length === k.length || keypath[k.length] === '.' ) ).length ) {
						this.newValues[ keypath ] = model.get();
					}
				});
				this.partial = true;
			}

			runloop.addObserver( this, this.defer );
			this.dirty = true;
			this.changed.length = 0;

			if ( this.once ) this.cancel();
		}
	}
}
