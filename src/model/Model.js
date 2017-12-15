import ModelBase, { maybeBind, shuffle } from './ModelBase';
import LinkModel from './LinkModel'; // eslint-disable-line no-unused-vars
import KeypathModel from './specials/KeypathModel';
import getComputationSignature from 'src/Ractive/helpers/getComputationSignature';
import { capture } from 'src/global/capture';
import { isArray, isEqual, isNumeric, isObjectLike } from 'utils/is';
import { handleChange, mark, markForce, marked, teardown } from 'shared/methodCallers';
import Ticker from 'shared/Ticker';
import getPrefixer from './helpers/getPrefixer';
import { unescapeKey } from 'shared/keypaths';
import { warnIfDebug } from 'utils/log';
import { hasOwn, keys } from 'utils/object';

export const shared = {};

export default class Model extends ModelBase {
	constructor ( parent, key ) {
		super( parent );

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

		const value = this.wrapper ? ( 'newWrapperValue' in this ? this.newWrapperValue : this.wrapperValue ) : this.value;

		// TODO remove this legacy nonsense
		const ractive = this.root.ractive;
		const keypath = this.getKeypath();

		// tear previous adaptor down if present
		if ( this.wrapper ) {
			const shouldTeardown = this.wrapperValue === value ? false : !this.wrapper.reset || this.wrapper.reset( value ) === false;

			if ( shouldTeardown ) {
				this.wrapper.teardown();
				delete this.wrapper;
				delete this.wrapperValue;

				// don't branch for undefined values
				if ( this.value !== undefined ) {
					const parentValue = this.parent.value || this.parent.createBranch( this.key );
					if ( parentValue[ this.key ] !== value ) parentValue[ this.key ] = value;
					this.value = value;
				}
			} else {
				delete this.newWrapperValue;
				this.value = this.wrapper.get();
				return;
			}
		}

		let i;

		for ( i = 0; i < len; i += 1 ) {
			const adaptor = adaptors[i];
			if ( adaptor.filter( value, keypath, ractive ) ) {
				this.wrapper = adaptor.wrap( ractive, value, keypath, getPrefixer( keypath ) );
				this.wrapperValue = value;
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
				fulfilPromise( to );
			}
		});

		promise.stop = this.ticker.stop;
		return promise;
	}

	applyValue ( value, notify = true ) {
		if ( isEqual( value, this.value ) ) return;
		if ( this.boundValue ) this.boundValue = null;

		if ( this.parent.wrapper && this.parent.wrapper.set ) {
			this.parent.wrapper.set( this.key, value );
			this.parent.value = this.parent.wrapper.get();

			this.value = this.parent.value[ this.key ];
			if ( this.wrapper ) this.newWrapperValue = this.value;
			this.adapt();
		} else if ( this.wrapper ) {
			this.newWrapperValue = value;
			this.adapt();
		} else {
			const parentValue = this.parent.value || this.parent.createBranch( this.key );
			if ( isObjectLike( parentValue ) ) {
				parentValue[ this.key ] = value;
			} else {
				warnIfDebug( `Attempted to set a property of a non-object '${this.getKeypath()}'` );
				return;
			}

			this.value = value;
			this.adapt();
		}

		// keep track of array stuff
		if ( isArray( value ) ) {
			this.length = value.length;
			this.isArray = true;
		} else {
			this.isArray = false;
		}

		// notify dependants
		this.links.forEach( handleChange );
		this.children.forEach( mark );
		this.deps.forEach( handleChange );

		if ( notify ) this.notifyUpstream();

		if ( this.parent.isArray ) {
			if ( this.key === 'length' ) this.parent.length = value;
			else this.parent.joinKey( 'length' ).mark();
		}
	}

	compute ( key, computed ) {
		const registry = this.computed || ( this.computed = {} );

		if ( registry[key] ) {
			registry[key].signature = getComputationSignature( this.root.ractive, key, computed );
			registry[key].mark();
		} else {
			registry[key] = new shared.Computation( this, getComputationSignature( this.root.ractive, key, computed ), key );
		}

		return registry[key];
	}

	createBranch ( key ) {
		const branch = isNumeric( key ) ? [] : {};
		this.applyValue( branch, false );

		return branch;
	}

	get ( shouldCapture, opts ) {
		if ( this._link ) return this._link.get( shouldCapture, opts );
		if ( shouldCapture ) capture( this );
		// if capturing, this value needs to be unwrapped because it's for external use
		if ( opts && opts.virtual ) return this.getVirtual( false );
		return maybeBind( this, ( ( opts && 'unwrap' in opts ) ? opts.unwrap !== false : shouldCapture ) && this.wrapper ? this.wrapperValue : this.value, !opts || opts.shouldBind !== false );
	}

	getKeypathModel () {
		if ( !this.keypathModel ) this.keypathModel = new KeypathModel( this );
		return this.keypathModel;
	}

	joinKey ( key, opts ) {
		if ( this._link ) {
			if ( opts && opts.lastLink !== false && ( key === undefined || key === '' ) ) return this;
			return this._link.joinKey( key );
		}

		if ( key === undefined || key === '' ) return this;

		let child;
		if ( hasOwn( this.childByKey, key ) ) child = this.childByKey[ key ];
		else child = this.computed && this.computed[ key ];

		if ( !child ) {
			let computed;
			if ( this.isRoot && this.ractive && ( computed = this.ractive.computed[ key ] ) ) {
				child = this.compute( key, computed );
			} else if ( !this.isRoot && this.root.ractive ) {
				const registry = this.root.ractive.computed;
				for ( const k in registry ) {
					computed = registry[k];
					if ( computed.pattern && computed.pattern.test( this.getKeypath() + '.' + key ) ) {
						child = this.compute( key, computed );
					}
				}
			}
		}

		if ( !child ) {
			child = new Model( this, key );
			this.children.push( child );
			this.childByKey[ key ] = child;
		}

		if (  child._link && ( !opts || opts.lastLink !== false ) ) return child._link;

		return child;
	}

	mark ( force ) {
		if ( this._link ) return this._link.mark( force );

		const old = this.value;
		const value = this.retrieve();

		if ( force || !isEqual( value, old ) ) {
			this.value = value;
			if ( this.boundValue ) this.boundValue = null;

			// make sure the wrapper stays in sync
			if ( old !== value || this.rewrap ) {
				if ( this.wrapper ) this.newWrapperValue = value;
				this.adapt();
			}

			// keep track of array stuff
			if ( isArray( value ) ) {
				this.length = value.length;
				this.isArray = true;
			} else {
				this.isArray = false;
			}

			this.children.forEach( force ? markForce : mark );
			this.links.forEach( marked );

			this.deps.forEach( handleChange );
		}
	}

	merge ( array, comparator ) {
		let oldArray = this.value;
		let newArray = array;
		if ( oldArray === newArray ) oldArray = recreateArray( this );
		if ( comparator ) {
			oldArray = oldArray.map( comparator );
			newArray = newArray.map( comparator );
		}

		const oldLength = oldArray.length;

		const usedIndices = {};
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
		this.shuffle( newIndices, true );
	}

	retrieve () {
		return this.parent.value ? this.parent.value[ this.key ] : undefined;
	}

	set ( value ) {
		if ( this.ticker ) this.ticker.stop();
		this.applyValue( value );
	}

	shuffle ( newIndices, unsafe ) {
		shuffle( this, newIndices, false, unsafe );
	}

	source () { return this; }

	teardown () {
		if ( this._link ) {
			this._link.teardown();
			this._link = null;
		}
		this.children.forEach( teardown );
		if ( this.wrapper ) this.wrapper.teardown();
		if ( this.keypathModel ) this.keypathModel.teardown();
		if ( this.computed ) keys( this.computed ).forEach( k => this.computed[k].teardown() );
	}
}

function recreateArray( model ) {
	const array = [];

	for ( let i = 0; i < model.length; i++ ) {
		array[ i ] = (model.childByKey[i] || {}).value;
	}

	return array;
}
