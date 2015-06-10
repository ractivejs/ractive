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
			return new ReferenceResolver( fragment, ref, model => {
				this.resolve( i, model );
			});
		});

		this.ready = true;
		this.bubble();
	}

	bubble () {
		if ( !this.ready ) return;

		const ractive = this.fragment.root;

		const key = this.template.s.replace( /_(\d+)/g, ( match, i ) => {
			return i >= this.models.length ? match : this.models[i].keypath;
		});

		const signature = {
			dependencies: this.models.filter( Boolean ),
			getter: () => {
				const values = this.models.map( model => model.value );
				return this.fn.apply( ractive, values );
			}
		};

		const model = this.fragment.root.viewmodel.compute( key, signature );
		this.callback( model );
	}

	resolve ( index, model ) {
		this.models[ index ] = model;
		this.bubble();
	}
}
