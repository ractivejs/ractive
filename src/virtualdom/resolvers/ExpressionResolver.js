import { startCapturing, stopCapturing } from 'global/capture';
import IndexReferenceResolver from './IndexReferenceResolver';
import ReferenceResolver from './ReferenceResolver';
import ShadowResolver from './ShadowResolver';

let functionCache = {};

function createFunction ( str, i ) {
	if ( functionCache[ str ] ) return functionCache[ str ];

	let args = new Array( i );
	while ( i-- ) args[i] = `_${i}`;

	const fn = new Function( args.join( ',' ), `return (${str})` );

	return ( functionCache[ str ] = fn );
}

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

			if ( ref[0] === '@' ) {
				throw new Error( 'TODO specials' );
			}

			// TODO handle fragment context changes (e.g. `{{#with foo[bar]}}...`)
			if ( ref === '.' || ref === 'this' ) {
				return new ShadowResolver( fragment, callback );
			}

			if ( ref in fragment.indexRefs ) {
				return new IndexReferenceResolver( fragment, ref, callback );
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
			dependencies: this.models.filter( Boolean ),
			getter: () => {
				const values = this.models.map( model => {
					if ( typeof model.value === 'function' ) {
						return wrapFunction( model.value, ractive, ractive._guid );
					} else {
						return model.value;
					}
				});

				startCapturing();
				const result = this.fn.apply( ractive, values );
				const softDeps = stopCapturing();

				model.setSoftDependencies( softDeps );

				return result;
			}
		};

		const model = ractive.viewmodel.compute( key, signature );
		model.init();
		this.callback( model );
	}

	resolve ( index, model ) {
		this.models[ index ] = model;
		this.bubble();
	}
}
