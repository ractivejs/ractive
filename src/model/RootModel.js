import { capture } from '../global/capture';
import Computation from './Computation';
import Model from './Model';
import { handleChange, mark } from '../shared/methodCallers';
import RactiveModel from './specials/RactiveModel';
import GlobalModel from './specials/GlobalModel';
import { splitKeypath, unescapeKey } from '../shared/keypaths';
import { warnIfDebug } from '../utils/log';

const hasProp = Object.prototype.hasOwnProperty;

export default class RootModel extends Model {
	constructor ( options ) {
		super( null, null );

		// TODO deprecate this
		this.changes = {};

		this.isRoot = true;
		this.root = this;
		this.ractive = options.ractive; // TODO sever this link

		this.value = options.data;
		this.adaptors = options.adapt;
		this.adapt();

		this.computationContext = options.ractive;
		this.computations = {};

		// TODO this is only for deprecation of using expression keypaths
		this.expressions = {};
	}

	applyChanges () {
		this._changeHash = {};
		this.flush();

		return this._changeHash;
	}

	compute ( key, signature ) {
		const computation = new Computation( this, signature, key );
		this.computations[ key ] = computation;

		return computation;
	}

	createLink ( keypath, target, targetPath ) {
		const keys = splitKeypath( keypath );

		let model = this;
		while ( keys.length ) {
			const key = keys.shift();
			model = this.childByKey[ key ] || this.joinKey( key );
		}

		return model.link( target, targetPath );
	}

	get ( shouldCapture, options ) {
		if ( shouldCapture ) capture( this );

		if ( !options || options.virtual !== false ) {
			const result = this.getVirtual();
			const keys = Object.keys( this.computations );
			let i = keys.length;
			while ( i-- ) {
				const computation = this.computations[ keys[i] ];
				// exclude template expressions
				if ( !computation.isExpression ) {
					result[ keys[i] ] = computation.get();
				}
			}

			return result;
		} else {
			return this.value;
		}
	}

	getKeypath () {
		return '';
	}

	getRactiveModel() {
		return this.ractiveModel || ( this.ractiveModel = new RactiveModel( this.ractive ) );
	}

	getValueChildren () {
		const children = super.getValueChildren( this.value );

		this.children.forEach( child => {
			if ( child._link ) {
				const idx = children.indexOf( child );
				if ( ~idx ) children.splice( idx, 1, child._link );
				else children.push( child._link );
			}
		});

		for ( let k in this.computations ) {
			children.push( this.computations[k] );
		}

		return children;
	}

	handleChange () {
		this.deps.forEach( handleChange );
	}

	has ( key ) {
		let value = this.value;

		key = unescapeKey( key );
		if ( hasProp.call( value, key ) ) return true;

		// mappings/links and computations
		if ( key in this.computations || this.childByKey[key] && this.childByKey[key]._link ) return true;
		// TODO remove this after deprecation is done
		if ( key in this.expressions ) return true;

		// We climb up the constructor chain to find if one of them contains the key
		let constructor = value.constructor;
		while ( constructor !== Function && constructor !== Array && constructor !== Object ) {
			if ( hasProp.call( constructor.prototype, key ) ) return true;
			constructor = constructor.constructor;
		}

		return false;
	}

	joinKey ( key, opts ) {
		if ( key === '@global' ) return GlobalModel;
		if ( key === '@this' ) return this.getRactiveModel();

		if ( this.expressions.hasOwnProperty( key ) ) {
			warnIfDebug( `Accessing expression keypaths (${ key.substr(1) }) from the instance is deprecated. You can used a getNodeInfo or event object to access keypaths with expression context.` );
			return this.expressions[ key ];
		}

		return this.computations.hasOwnProperty( key ) ? this.computations[ key ] :
		       super.joinKey( key, opts );
	}

	map ( localKey, origin ) {
		const local = this.joinKey( localKey );
		local.link( origin );
	}

	rebinding () {
	}

	set ( value ) {
		// TODO wrapping root node is a baaaad idea. We should prevent this
		const wrapper = this.wrapper;
		if ( wrapper ) {
			const shouldTeardown = !wrapper.reset || wrapper.reset( value ) === false;

			if ( shouldTeardown ) {
				wrapper.teardown();
				this.wrapper = null;
				this.value = value;
				this.adapt();
			}
		} else {
			this.value = value;
			this.adapt();
		}

		this.deps.forEach( handleChange );
		this.children.forEach( mark );
		this.clearUnresolveds(); // TODO do we need to do this with primitive values? if not, what about e.g. unresolved `length` property of null -> string?
	}

	retrieve () {
		return this.value;
	}

	update () {
		// noop
	}
}
