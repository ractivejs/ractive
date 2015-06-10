import IndexReferenceResolver from './IndexReferenceResolver';
import ReferenceResolver from './ReferenceResolver';

let functionCache = {};

function createFunction ( str, i ) {
	if ( functionCache[ str ] ) return functionCache[ str ];

	let args = new Array( i );
	while ( i-- ) args[i] = `_${i}`;

	const fn = new Function ( args.join( ',' ), `return (${str})` );

	return ( functionCache[ str ] = fn );
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

			return ref in fragment.indexRefs ?
				new IndexReferenceResolver( fragment, ref, callback ) :
				new ReferenceResolver( fragment, ref, callback );
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
				const values = this.models.map( model => model.value );
				return this.fn.apply( ractive, values );
			}
		};

		const model = ractive.viewmodel.compute( key, signature );
		this.callback( model );
	}

	resolve ( index, model ) {
		this.models[ index ] = model;
		this.bubble();
	}
}
