import { capture } from '../global/capture';
import Computation from './Computation';
import Model from './Model';
import { handleChange, mark } from '../shared/methodCallers';
import RactiveModel from './specials/RactiveModel';
import SharedModel, { GlobalModel } from './specials/SharedModel';
import { splitKeypath, unescapeKey } from '../shared/keypaths';
import resolveReference from '../view/resolvers/resolveReference';

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
	}

	applyChanges () {
		this._changeHash = {};
		this.flush();

		return this._changeHash;
	}

	attached ( fragment ) {
		attachImplicits( this, fragment );
	}

	compute ( key, signature ) {
		const computation = new Computation( this, signature, key );
		this.computations[ key ] = computation;

		return computation;
	}

	createLink ( keypath, target, targetPath, options ) {
		const keys = splitKeypath( keypath );

		let model = this;
		while ( keys.length ) {
			const key = keys.shift();
			model = this.childByKey[ key ] || this.joinKey( key );
		}

		return model.link( target, targetPath, options );
	}

	detached () {
		detachImplicits( this );
	}

	get ( shouldCapture, options ) {
		if ( shouldCapture ) capture( this );

		if ( !options || options.virtual !== false ) {
			const result = this.getVirtual();
			const keys = Object.keys( this.computations );
			let i = keys.length;
			while ( i-- ) {
				result[ keys[i] ] = this.computations[ keys[i] ].get();
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

		for ( const k in this.computations ) {
			children.push( this.computations[k] );
		}

		return children;
	}

	handleChange () {
		this.deps.forEach( handleChange );
	}

	has ( key ) {
		const value = this.value;

		key = unescapeKey( key );
		if ( key === '@this' || key === '@global' || key === '@shared' ) return true;
		if ( key[0] === '~' && key[1] === '/' ) key = key.slice( 2 );
		if ( hasProp.call( value, key ) ) return true;

		// mappings/links and computations
		if ( key in this.computations || this.childByKey[key] && this.childByKey[key]._link ) return true;

		// We climb up the constructor chain to find if one of them contains the key
		let constructor = value.constructor;
		while ( constructor !== Function && constructor !== Array && constructor !== Object ) {
			if ( hasProp.call( constructor.prototype, key ) ) return true;
			constructor = constructor.constructor;
		}

		return false;
	}

	joinKey ( key, opts ) {
		if ( key[0] === '@' ) {
			if ( key === '@this' || key === '@' ) return this.getRactiveModel();
			if ( key === '@global' ) return GlobalModel;
			if ( key === '@shared' ) return SharedModel;
			return;
		}

		if ( key[0] === '~' && key[1] === '/' ) key = key.slice( 2 );

		return this.computations.hasOwnProperty( key ) ? this.computations[ key ] :
		       super.joinKey( key, opts );
	}

	// TODO: this should go away
	map ( localKey, origin, options ) {
		const local = this.joinKey( localKey );
		local.link( origin, localKey, options );
	}

	rebind () {
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
		return this.wrapper ? this.wrapper.get() : this.value;
	}

	teardown () {
		super.teardown();
		for ( const k in this.computations ) {
			this.computations[ k ].teardown();
		}
	}

	update () {
		// noop
	}
}

function attachImplicits ( model, fragment ) {
	if ( model._link && model._link.implicit && model._link.isDetached() ) {
		model.attach( fragment );
	}

	// look for unresolveds
	let i = model.unresolved.length;
	while ( i-- ) {
		const mdl = resolveReference( fragment, model.unresolved[i] );
		if ( mdl ) {
			model.joinKey( mdl.key ).link( mdl, mdl.key, { implicit: true } );
		}
	}

	// look for virtual children to relink and cascade
	for ( const k in model.childByKey ) {
		if ( k in model.value ) {
			attachImplicits( model.childByKey[k], fragment );
		} else if ( !model.childByKey[k]._link || model.childByKey[k]._link.isDetached() ) {
			const mdl = resolveReference( fragment, k );
			if ( mdl ) {
				model.childByKey[k].link( mdl, k, { implicit: true } );
			}
		}
	}
}

function detachImplicits ( model ) {
	if ( model._link && model._link.implicit ) {
		model.unlink();
	}

	for ( const k in model.childByKey ) {
		detachImplicits( model.childByKey[k] );
	}
}
