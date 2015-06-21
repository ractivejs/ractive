import DataNode from 'viewmodel/nodes/DataNode';
import { unbind } from 'shared/methodCallers';
import createFunction from 'shared/createFunction';
import resolveReference from './resolveReference';

function wrapFunction ( fn, context, uid ) {
	if ( fn.__nowrap ) return fn;

	const wrapProp = `__ractive_${uid}`;

	if ( fn[ wrapProp ] ) return fn[ wrapProp ];

	if ( !/\bthis\b/.test( fn ) ) {
		fn.__nowrap = true;
		return fn;
	}

	return ( fn[ wrapProp ] = fn.bind( context ) );
}

export default class ExpressionProxy extends DataNode {
	constructor ( fragment, template ) {
		super( fragment.ractive.viewmodel, null );

		this.fragment = fragment;
		this.template = template;

		this.fn = createFunction( template.s, template.r.length );
		this.computation = null;

		this.resolvers = [];
		this.models = template.r.map( ( ref, index ) => {
			const model = resolveReference( fragment, ref );

			if ( !model ) {
				const resolver = fragment.resolve( ref, model => {
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

		const key = this.template.s.replace( /_(\d+)/g, ( match, i ) => {
			if ( i >= this.models.length ) return match;

			const model = this.models[i];
			return model ? model.getKeypath() : '@undefined';
		});

		const signature = {
			getter: () => {
				const values = this.models.map( model => {
					const value = model.get();

					if ( typeof value === 'function' ) {
						return wrapFunction( value, ractive, ractive._guid );
					} else {
						return value;
					}
				});

				return this.fn.apply( ractive, values );
			},
			getterString: key
		};

		// TODO avoid recreating the same computation multiple times
		const computation = ractive.viewmodel.compute( key, signature );
		computation.init();

		this.value = computation.value;

		if ( this.computation ) {
			this.computation.unregister( this );
			// notify children...
		}

		this.computation = computation;
		computation.register( this );
	}

	get () {
		return this.computation.value;
	}

	handleChange () {
		this.mark();
	}

	unbind () {
		this.resolvers.forEach( unbind );
	}
}
