export function link( there, here ) {
	let mapping = this.mappings[here.str], error;

	// unlink the existing mapping or return the error object from trying to do so
	if ( mapping && ( error = this.unlink( here ) ) ) {
		return error;
	}

	let deps = {
		default: stealMappings( this, here, 'default' ),
		computed: stealMappings( this, here, 'computed' )
	};

	mapping = this.map( here, { origin: this, keypath: there } );
	deps.default.forEach( d => this.register( d.keypath, d.dep, 'default' ) );
	deps.computed.forEach( d => this.register( d.keypath, d.dep, 'computed' ) );
	this.mark( here );
	this.mark( there );
}

export function unlink( here ) {
	let mapping = this.mappings[here.str];
	// if the existing mapping isn't entirely local, tell upstream to bail
	if ( mapping && mapping.origin === mapping.local && mapping.local === this ) {
		let deps = mapping.deps.slice( 0 );
		deps.forEach( d => mapping.unregister( d.keypath, d.dep, d.group ) );
		delete this.mappings[here.str];
		deps.forEach( d => mapping.origin.register( d.keypath, d.dep, d.group ) );
		this.mark( here );
	} else {
		return { message: `A component link already exists for ${here.str}` };
	}
}

function stealMappings(viewmodel, keypath, group, out = []) {
	let deps = viewmodel.deps[group][keypath.str];
	if (deps) {
		out = out.concat(deps.map(d => { return { keypath, dep: d }; }));
		deps.forEach(d => viewmodel.unregister(keypath, d, group));
	}

	let map = viewmodel.depsMap[group][keypath.str];
	if (map) {
		map.slice(0).forEach(k => out = stealMappings(viewmodel, k, group, out));
	}

	return out;
}
