import Model from '../../model/Model';
import Computation from '../../model/Computation';
import getFunction from '../../shared/getFunction';
import resolveReference from './resolveReference';
import { removeFromArray } from '../../utils/array';
import { startCapturing, stopCapturing } from '../../global/capture';
import { warnIfDebug } from '../../utils/log';
import { rebindMatch } from '../../shared/rebind';
import noop from '../../utils/noop';

export default class ExpressionProxy extends Model {
	constructor ( fragment, template ) {
		super( fragment.ractive.viewmodel, null );

		this.fragment = fragment;
		this.template = template;

		this.isReadonly = true;
		this.dirty = true;

		this.fn = fragment.ractive.allowExpressions === false ?
			noop :
			getFunction( template.s, template.r.length );

		this.models = this.template.r.map( ref => {
			return resolveReference( this.fragment, ref );
		});
		this.dependencies = [];

		this.shuffle = undefined;

		this.bubble();
	}

	bubble ( actuallyChanged = true ) {
		// refresh the keypath
		this.keypath = undefined;

		if ( actuallyChanged ) {
			this.handleChange();
		}
	}

	getKeypath () {
		if ( !this.template ) return '@undefined';
		if ( !this.keypath ) {
			this.keypath = '@' + this.template.s.replace( /_(\d+)/g, ( match, i ) => {
				if ( i >= this.models.length ) return match;

				const model = this.models[i];
				return model ? model.getKeypath() : '@undefined';
			});
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

	notifyUpstream () {}

	rebind ( next, previous, safe ) {
		const idx = this.models.indexOf( previous );

		if ( ~idx ) {
			next = rebindMatch( this.template.r[idx], next, previous );
			if ( next !== previous ) {
				previous.unregister( this );
				this.models.splice( idx, 1, next );
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

	unreference () {
		super.unreference();
		if ( !this.deps.length && !this.refs ) this.teardown();
	}

	unregister( dep ) {
		super.unregister( dep );
		if ( !this.deps.length && !this.refs ) this.teardown();
	}
}

const prototype = ExpressionProxy.prototype;
const computation = Computation.prototype;
prototype.get = computation.get;
prototype.handleChange = computation.handleChange;
prototype.joinKey = computation.joinKey;
prototype.mark = computation.mark;
prototype.unbind = noop;
