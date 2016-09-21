import ModelBase, { fireShuffleTasks } from './ModelBase';
import LinkModel from './LinkModel';
import KeypathModel from './specials/KeypathModel';
import { capture } from '../global/capture';
import Promise from '../utils/Promise';
import { isArray, isEqual, isNumeric } from '../utils/is';
import { handleChange, mark, marked, teardown } from '../shared/methodCallers';
import Ticker from '../shared/Ticker';
import getPrefixer from './helpers/getPrefixer';
import { unescapeKey } from '../shared/keypaths';

export default class Model extends ModelBase {
	constructor ( parent, key ) {
		super( parent );

		this.value = undefined;

		this.ticker = null;

		if ( parent ) {
			this.key = unescapeKey( key );
			this.isReadonly = parent.isReadonly;

			if ( parent.value ) {
				this.value = parent.value[ this.key ];
				if ( isArray( this.value ) ) this.length = this.value.length;
				this.adapt();
			}
		}
	}

	adapt () {
		const adaptors = this.root.adaptors;
		const len = adaptors.length;

		this.rewrap = false;

		// Exit early if no adaptors
		if ( len === 0 ) return;

		const value = this.value;

		// TODO remove this legacy nonsense
		const ractive = this.root.ractive;
		const keypath = this.getKeypath();

		// tear previous adaptor down if present
		if ( this.wrapper ) {
			const shouldTeardown = !this.wrapper.reset || this.wrapper.reset( value ) === false;

			if ( shouldTeardown ) {
				this.wrapper.teardown();
				this.wrapper = null;

				// don't branch for undefined values
				if ( this.value !== undefined ) {
					const parentValue = this.parent.value || this.parent.createBranch( this.key );
					if ( parentValue[ this.key ] !== this.value ) parentValue[ this.key ] = value;
				}
			} else {
				this.value = this.wrapper.get();
				return;
			}
		}

		let i;

		for ( i = 0; i < len; i += 1 ) {
			const adaptor = adaptors[i];
			if ( adaptor.filter( value, keypath, ractive ) ) {
				this.wrapper = adaptor.wrap( ractive, value, keypath, getPrefixer( keypath ) );
				this.wrapper.value = this.value;
				this.wrapper.__model = this; // massive temporary hack to enable array adaptor

				this.value = this.wrapper.get();

				break;
			}
		}
	}

	animate ( from, to, options, interpolator ) {
		if ( this.ticker ) this.ticker.stop();

		let fulfilPromise;
		const promise = new Promise( fulfil => fulfilPromise = fulfil );

		this.ticker = new Ticker({
			duration: options.duration,
			easing: options.easing,
			step: t => {
				const value = interpolator( t );
				this.applyValue( value );
				if ( options.step ) options.step( t, value );
			},
			complete: () => {
				this.applyValue( to );
				if ( options.complete ) options.complete( to );

				this.ticker = null;
				fulfilPromise();
			}
		});

		promise.stop = this.ticker.stop;
		return promise;
	}

	applyValue ( value ) {
		if ( isEqual( value, this.value ) ) return;

		// TODO deprecate this nonsense
		this.registerChange( this.getKeypath(), value );

		if ( this.parent.wrapper && this.parent.wrapper.set ) {
			this.parent.wrapper.set( this.key, value );
			this.parent.value = this.parent.wrapper.get();

			this.value = this.parent.value[ this.key ];
			this.adapt();
		} else if ( this.wrapper ) {
			this.value = value;
			this.adapt();
		} else {
			const parentValue = this.parent.value || this.parent.createBranch( this.key );
			parentValue[ this.key ] = value;

			this.value = value;
			this.adapt();
		}

		this.parent.clearUnresolveds();
		this.clearUnresolveds();

		// keep track of array length
		if ( isArray( value ) ) this.length = value.length;

		// notify dependants
		this.links.forEach( handleChange );
		this.children.forEach( mark );
		this.deps.forEach( handleChange );

		this.notifyUpstream();

		if ( this.key === 'length' && isArray( this.parent.value ) ) this.parent.length = this.parent.value.length;
	}

	createBranch ( key ) {
		const branch = isNumeric( key ) ? [] : {};
		this.set( branch );

		return branch;
	}

	get ( shouldCapture, opts ) {
		if ( this._link ) return this._link.get( shouldCapture, opts );
		if ( shouldCapture ) capture( this );
		// if capturing, this value needs to be unwrapped because it's for external use
		if ( opts && opts.virtual ) return this.getVirtual( false );
		return ( shouldCapture || ( opts && opts.unwrap ) ) && this.wrapper ? this.wrapper.value : this.value;
	}

	getKeypathModel ( ractive ) {
		if ( !this.keypathModel ) this.keypathModel = new KeypathModel( this );
		return this.keypathModel;
	}

	joinKey ( key, opts ) {
		if ( this._link ) {
			if ( opts && !opts.lastLink === false && ( key === undefined || key === '' ) ) return this;
			return this._link.joinKey( key );
		}

		if ( key === undefined || key === '' ) return this;


		if ( !this.childByKey.hasOwnProperty( key ) ) {
			const child = new Model( this, key );
			this.children.push( child );
			this.childByKey[ key ] = child;
		}

		if ( this.childByKey[ key ]._link ) return this.childByKey[ key ]._link;
		return this.childByKey[ key ];
	}

	mark () {
		if ( this._link ) return this._link.mark();

		const value = this.retrieve();

		if ( !isEqual( value, this.value ) ) {
			const old = this.value;
			this.value = value;

			// make sure the wrapper stays in sync
			if ( old !== value || this.rewrap ) this.adapt();

			// keep track of array lengths
			if ( isArray( value ) ) this.length = value.length;

			this.children.forEach( mark );
			this.links.forEach( marked );

			this.deps.forEach( handleChange );
			this.clearUnresolveds();
		}
	}

	merge ( array, comparator ) {
		let oldArray = this.value, newArray = array;
		if ( oldArray === newArray ) oldArray = recreateArray( this );
		if ( comparator ) {
			oldArray = oldArray.map( comparator );
			newArray = newArray.map( comparator );
		}

		const oldLength = oldArray.length;

		let usedIndices = {};
		let firstUnusedIndex = 0;

		const newIndices = oldArray.map( item => {
			let index;
			let start = firstUnusedIndex;

			do {
				index = newArray.indexOf( item, start );

				if ( index === -1 ) {
					return -1;
				}

				start = index + 1;
			} while ( ( usedIndices[ index ] === true ) && start < oldLength );

			// keep track of the first unused index, so we don't search
			// the whole of newArray for each item in oldArray unnecessarily
			if ( index === firstUnusedIndex ) {
				firstUnusedIndex += 1;
			}
			// allow next instance of next "equal" to be found item
			usedIndices[ index ] = true;
			return index;
		});

		this.parent.value[ this.key ] = array;
		this.shuffle( newIndices );
	}

	retrieve () {
		return this.parent.value ? this.parent.value[ this.key ] : undefined;
	}

	set ( value ) {
		if ( this.ticker ) this.ticker.stop();
		this.applyValue( value );
	}

	shuffle ( newIndices ) {
		this.shuffling = true;
		let i = newIndices.length;
		while ( i-- ) {
			const idx = newIndices[ i ];
			// nothing is actually changing, so move in the index and roll on
			if ( i === idx ) {
				continue;
			}

			// rebind the children on i to idx
			if ( i in this.childByKey ) this.childByKey[ i ].rebinding( !~idx ? undefined : this.joinKey( idx ), this.childByKey[ i ], true );

			if ( !~idx && this.keyModels[ i ] ) {
				this.keyModels[i].rebinding( undefined, this.keyModels[i], false );
			} else if ( ~idx && this.keyModels[ i ] ) {
				if ( !this.keyModels[ idx ] ) this.childByKey[ idx ].getKeyModel( idx );
				this.keyModels[i].rebinding( this.keyModels[ idx ], this.keyModels[i], false );
			}
		}

		const upstream = this.length !== this.value.length;

		this.links.forEach( l => l.shuffle( newIndices ) );
		fireShuffleTasks( 'early' );

		i = this.deps.length;
		while ( i-- ) {
			if ( this.deps[i].shuffle ) this.deps[i].shuffle( newIndices );
		}

		this.mark();
		fireShuffleTasks( 'mark' );

		if ( upstream ) this.notifyUpstream();
		this.shuffling = false;
	}

	teardown () {
		if ( this._link ) this._link.teardown();
		this.children.forEach( teardown );
		if ( this.wrapper ) this.wrapper.teardown();
		if ( this.keypathModel ) this.keypathModel.teardown();
	}
}

function recreateArray( model ) {
	const array = [];

	for ( let i = 0; i < model.length; i++ ) {
		array[ i ] = (model.childByKey[i] || {}).value;
	}

	return array;
}
