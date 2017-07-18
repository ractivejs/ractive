import { capture } from '../global/capture';
import Computation from './Computation';
import Model from './Model';
import { handleChange, mark } from '../shared/methodCallers';
import RactiveModel from './specials/RactiveModel';
import SharedModel, { GlobalModel } from './specials/SharedModel';
import { splitKeypath, escapeKey, unescapeKey } from '../shared/keypaths';
import resolveReference from '../view/resolvers/resolveReference';
import noop from '../utils/noop';

const hasProp = Object.prototype.hasOwnProperty;

export default class RootModel extends Model {
	constructor ( options ) {
		super( null, null );

		this.isRoot = true;
		this.root = this;
		this.ractive = options.ractive; // TODO sever this link

		this.value = options.data;
		this.adaptors = options.adapt;
		this.adapt();

		this.computationContext = options.ractive;
		this.computations = {};
	}

	attached ( fragment ) {
		attachImplicits( this, fragment );
	}

	compute ( key, signature ) {
		const computation = new Computation( this, signature, key );
		this.computations[ escapeKey( key ) ] = computation;

		return computation;
	}

	createLink ( keypath, target, targetPath, options ) {
		const keys = splitKeypath( keypath );

		let model = this;
		while ( keys.length ) {
			const key = keys.shift();
			model = model.childByKey[ key ] || model.joinKey( key );
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

	has ( key ) {
		const value = this.value;
		let unescapedKey = unescapeKey( key );

		if ( unescapedKey === '@this' || unescapedKey === '@global' || unescapedKey === '@shared' ) return true;
		if ( unescapedKey[0] === '~' && unescapedKey[1] === '/' ) unescapedKey = unescapedKey.slice( 2 );
		if ( key === '' || hasProp.call( value, unescapedKey ) ) return true;

		// mappings/links and computations
		if ( key in this.computations || this.childByKey[unescapedKey] && this.childByKey[unescapedKey]._link ) return true;

		// We climb up the constructor chain to find if one of them contains the unescapedKey
		let constructor = value.constructor;
		while ( constructor !== Function && constructor !== Array && constructor !== Object ) {
			if ( hasProp.call( constructor.prototype, unescapedKey ) ) return true;
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
}
RootModel.prototype.update = noop;

function attachImplicits ( model, fragment ) {
	if ( model._link && model._link.implicit && model._link.isDetached() ) {
		model.attach( fragment );
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
