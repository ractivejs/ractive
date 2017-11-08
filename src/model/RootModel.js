import { capture } from 'src/global/capture';
import Model from './Model';
import { handleChange, mark } from 'shared/methodCallers';
import RactiveModel from './specials/RactiveModel';
import SharedModel, { GlobalModel, SharedModel as SharedBase } from './specials/SharedModel';
import { splitKeypath, unescapeKey } from 'shared/keypaths';
import resolveReference from 'src/view/resolvers/resolveReference';
import noop from 'utils/noop';

const specialModels = {
	'@this'( root ) { return root.getRactiveModel(); },
	'@global'() { return GlobalModel; },
	'@shared'() { return SharedModel; },
	'@style'( root ) { return root.getRactiveModel().joinKey( 'cssData' ); },
	'@helpers'(root) { return root.getHelpers(); }
};
specialModels['@'] = specialModels['@this'];

export default class RootModel extends Model {
	constructor ( options ) {
		super( null, null );

		this.isRoot = true;
		this.root = this;
		this.ractive = options.ractive; // TODO sever this link

		this.value = options.data;
		this.adaptors = options.adapt;
		this.adapt();
	}

	attached ( fragment ) {
		attachImplicits( this, fragment );
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
			return this.getVirtual();
		} else {
			return this.value;
		}
	}

	getHelpers() {
		if ( !this.helpers ) this.helpers = new SharedBase( this.ractive.helpers, 'helpers' );
		return this.helpers;
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

		return children;
	}

	has ( key ) {
		if ( key[0] === '~' && key[1] === '/' ) key = key.slice( 2 );
		if ( specialModels[ key ] || key === '' ) return true;

		if ( super.has( key ) ) {
			return true;
		} else {
			const unescapedKey = unescapeKey( key );

			// mappings/links and computations
			if ( this.childByKey[unescapedKey] && this.childByKey[unescapedKey]._link ) return true;
		}
	}

	joinKey ( key, opts ) {
		if ( key[0] === '~' && key[1] === '/' ) key = key.slice( 2 );

		if ( key[0] === '@' ) {
			const fn = specialModels[key];
			if ( fn ) return fn( this );
		} else {
			return super.joinKey( key, opts );
		}
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
