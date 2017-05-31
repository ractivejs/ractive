import { escapeKey } from '../../../shared/keypaths';
import { removeFromArray } from '../../../utils/array';
import { isEqual } from '../../../utils/is';
import runloop from '../../../global/runloop';

const star = /\*+/g;

export default class PatternObserver {
	constructor ( ractive, baseModel, keys, callback, options ) {
		this.context = options.context || ractive;
		this.ractive = ractive;
		this.baseModel = baseModel;
		this.keys = keys;
		this.callback = callback;

		const pattern = keys.join( '\\.' ).replace( star, '(.+)' );
		const baseKeypath = this.baseKeypath = baseModel.getKeypath( ractive );
		this.pattern = new RegExp( `^${baseKeypath ? baseKeypath + '\\.' : ''}${pattern}$` );
		this.recursive = keys.length === 1 && keys[0] === '**';
		if ( this.recursive ) this.keys = [ '*' ];

		this.oldValues = {};
		this.newValues = {};

		this.defer = options.defer;
		this.once = options.once;
		this.strict = options.strict;

		this.dirty = false;
		this.changed = [];
		this.partial = false;
		this.links = options.links;

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

		this.dirty = false;
	}

	notify ( key ) {
		this.changed.push( key );
	}

	shuffle ( newIndices ) {
		if ( !Array.isArray( this.baseModel.value ) ) return;

		const max = this.baseModel.value.length;

		for ( let i = 0; i < newIndices.length; i++ ) {
			if ( newIndices[ i ] === -1 || newIndices[ i ] === i ) continue;
			this.changed.push([ i ]);
		}

		for ( let i = newIndices.touchedFrom; i < max; i++ ) {
			this.changed.push([ i ]);
		}
	}

	handleChange () {
		if ( !this.dirty || this.changed.length ) {
			if ( !this.dirty ) this.newValues = {};

			if ( !this.changed.length ) {
				this.baseModel.findMatches( this.keys ).forEach( model => {
					const keypath = model.getKeypath( this.ractive );
					this.newValues[ keypath ] = model.get();
				});
				this.partial = false;
			} else {
				let count = 0;

				if ( this.recursive ) {
					this.changed.forEach( keys => {
						const model = this.baseModel.joinAll( keys );
						if ( model.isLink && !this.links ) return;
						count++;
						this.newValues[ model.getKeypath( this.ractive ) ] = model.get();
					});
				} else {
					const ok = this.baseModel.isRoot ?
						this.changed.map( keys => keys.map( escapeKey ).join( '.' ) ) :
						this.changed.map( keys => this.baseKeypath + '.' + keys.map( escapeKey ).join( '.' ) );

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
				}

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
