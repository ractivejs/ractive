import Model from '../../model/Model';
import { unbind } from '../../shared/methodCallers';
import createFunction from '../../shared/createFunction';
import resolveReference from './resolveReference';
import { removeFromArray } from '../../utils/array';
import { defineProperty } from '../../utils/object';

function getValue ( model ) {
	return model ? model.get( true ) : undefined;
}

export default class ExpressionProxy extends Model {
	constructor ( fragment, template ) {
		super( fragment.ractive.viewmodel, null );

		this.fragment = fragment;
		this.template = template;

		this.isReadonly = true;

		this.fn = createFunction( template.s, template.r.length );
		this.computation = null;

		this.resolvers = [];
		this.models = template.r.map( ( ref, index ) => {
			const model = resolveReference( fragment, ref );
			let resolver;

			if ( !model ) {
				resolver = fragment.resolve( ref, model => {
					removeFromArray( this.resolvers, resolver );
					this.models[ index ] = model;
					this.bubble();
				});

				this.resolvers.push( resolver );
			}

			return model;
		});

		this.bubble();
	}

	bubble () {
		const ractive = this.fragment.ractive;

		// TODO the @ prevents computed props from shadowing keypaths, but the real
		// question is why it's a computed prop in the first place... (hint, it's
		// to do with {{else}} blocks)
		const key = '@' + this.template.s.replace( /_(\d+)/g, ( match, i ) => {
			if ( i >= this.models.length ) return match;

			const model = this.models[i];
			return model ? model.getKeypath() : '@undefined';
		});

		// TODO can/should we reuse computations?
		const signature = {
			getter: () => {
				const values = this.models.map( getValue );
				return this.fn.apply( ractive, values );
			},
			getterString: key
		};

		const computation = ractive.viewmodel.compute( key, signature );
		computation.init();

		this.value = computation.get(); // TODO should not need this, eventually

		if ( this.computation ) {
			this.computation.unregister( this );
			// notify children...
		}

		this.computation = computation;
		computation.register( this );
	}

	get () {
		return this.computation.get();
	}

	getKeypath () {
		return this.computation ? this.computation.getKeypath() : '@undefined';
	}

	handleChange () {
		this.mark();
	}

	retrieve () {
		return this.get();
	}

	unbind () {
		this.resolvers.forEach( unbind );
	}
}
