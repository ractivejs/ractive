import Model from '../../model/Model';
import ComputationChild from '../../model/ComputationChild';
import { handleChange, marked, unbind } from '../../shared/methodCallers';
import getFunction from '../../shared/getFunction';
import resolveReference from './resolveReference';
import { removeFromArray } from '../../utils/array';
import { capture, startCapturing, stopCapturing } from '../../global/capture';
import { warnIfDebug } from '../../utils/log';
import { rebindMatch } from '../../shared/rebind';

function createResolver ( proxy, ref, index ) {
	const resolver = proxy.fragment.resolve( ref, model => {
		removeFromArray( proxy.resolvers, resolver );
		proxy.models[ index ] = model;
		proxy.bubble();
	});

	proxy.resolvers.push( resolver );
}

export default class ExpressionProxy extends Model {
	constructor ( fragment, template ) {
		super( fragment.ractive.viewmodel, null );

		this.fragment = fragment;
		this.template = template;

		this.isReadonly = true;
		this.dirty = true;

		this.fn = getFunction( template.s, template.r.length );

		this.resolvers = [];
		this.models = this.template.r.map( ( ref, index ) => {
			const model = resolveReference( this.fragment, ref );

			if ( !model ) {
				createResolver( this, ref, index );
			}

			return model;
		});
		this.dependencies = [];

		this.shuffle = undefined;

		this.bubble();
	}

	bubble ( actuallyChanged = true ) {
		// refresh the keypath
		if ( this.registered ) delete this.root.expressions[ this.keypath ];
		this.keypath = undefined;

		if ( actuallyChanged ) {
			this.dirty = true;
			this.handleChange();
		}
	}

	get ( shouldCapture ) {
		if ( shouldCapture ) capture( this );

		if ( this.dirty ) {
			this.dirty = false;
			this.value = this.getValue();
			if ( this.wrapper ) this.newWrapperValue = this.value;
			this.adapt();
		}

		return shouldCapture && this.wrapper ? this.wrapperValue : this.value;
	}

	getKeypath () {
		if ( !this.template ) return '@undefined';
		if ( !this.keypath ) {
			this.keypath = '@' + this.template.s.replace( /_(\d+)/g, ( match, i ) => {
				if ( i >= this.models.length ) return match;

				const model = this.models[i];
				return model ? model.getKeypath() : '@undefined';
			});

			this.root.expressions[ this.keypath ] = this;
			this.registered = true;
		}

		return this.keypath;
	}

	getValue () {
		startCapturing();
		let result;

		try {
			const params = this.models.map( m => m ? m.get( true ) : undefined );
			result = this.fn.apply( this.fragment.ractive, params );
		} catch ( err ) {
			warnIfDebug( `Failed to compute ${this.getKeypath()}: ${err.message || err}` );
		}

		const dependencies = stopCapturing();
		// remove missing deps
		this.dependencies.filter( d => !~dependencies.indexOf( d ) ).forEach( d => {
			d.unregister( this );
			removeFromArray( this.dependencies, d );
		});
		// register new deps
		dependencies.filter( d => !~this.dependencies.indexOf( d ) ).forEach( d => {
			d.register( this );
			this.dependencies.push( d );
		});

		return result;
	}

	handleChange () {
		this.dirty = true;

		this.links.forEach( marked );
		this.deps.forEach( handleChange );
		this.children.forEach( handleChange );

		this.clearUnresolveds();
	}

	joinKey ( key ) {
		if ( key === undefined || key === '' ) return this;

		if ( !this.childByKey.hasOwnProperty( key ) ) {
			const child = new ComputationChild( this, key );
			this.children.push( child );
			this.childByKey[ key ] = child;
		}

		return this.childByKey[ key ];
	}

	mark () {
		this.handleChange();
	}

	rebinding ( next, previous, safe ) {
		const idx = this.models.indexOf( previous );

		if ( ~idx ) {
			next = rebindMatch( this.template.r[idx], next, previous );
			if ( next !== previous ) {
				previous.unregister( this );
				this.models.splice( idx, 1, next );
				// TODO: set up a resolver if there is no next?
				if ( next ) next.addShuffleRegister( this, 'mark' );
			}
		}
		this.bubble( !safe );
	}

	retrieve () {
		return this.get();
	}

	teardown () {
		this.unbind();
		this.fragment = undefined;
		if ( this.dependencies ) this.dependencies.forEach( d => d.unregister( this ) );
		super.teardown();
	}

	unregister( dep ) {
		super.unregister( dep );
		if ( !this.deps.length ) this.teardown();
	}

	unbind () {
		this.resolvers.forEach( unbind );
	}
}
