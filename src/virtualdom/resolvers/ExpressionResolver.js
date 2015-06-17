import IndexReferenceResolver from './IndexReferenceResolver';
import KeyReferenceResolver from './KeyReferenceResolver';
import ReferenceResolver from './ReferenceResolver';
import ShadowResolver from './ShadowResolver';
import { unbind } from 'shared/methodCallers';
import createFunction from 'shared/createFunction';

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

export default class ExpressionResolver {
	constructor ( fragment, template, callback ) {
		this.fragment = fragment;
		this.template = template;
		this.callback = callback;

		this.fn = createFunction( template.s, template.r.length );

		this.models = new Array( template.r.length );

		this.resolvers = template.r.map( ( ref, i ) => {
			const callback = model => this.resolve( i, model );

			// TODO handle fragment context changes (e.g. `{{#with foo[bar]}}...`)
			if ( ref === '.' || ref === 'this' ) {
				return new ShadowResolver( fragment, callback );
			}

			if ( ref === '@index' || ref in fragment.indexRefs ) {
				return new IndexReferenceResolver( fragment, ref, callback );
			}

			if ( ref === '@key' || ref in fragment.keyRefs ) {
				return new KeyReferenceResolver( fragment, ref, callback );
			}

			if ( ref[0] === '@' ) {
				throw new Error( 'TODO specials' );
			}

			return new ReferenceResolver( fragment, ref, callback );
		});

		this.ready = true;
		this.bubble();
	}

	bubble () {
		if ( !this.ready ) return;

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

		const model = ractive.viewmodel.compute( key, signature );
		model.init();
		this.callback( model );
	}

	resolve ( index, model ) {
		this.models[ index ] = model;
		this.bubble();
	}

	unbind () {
		this.resolvers.forEach( unbind );
	}
}
