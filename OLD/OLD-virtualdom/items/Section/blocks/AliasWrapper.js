class AliasWrapper {

	constructor ( context, references ) {
		this.context = context;
		this.aliases = references.aliases;
		this.specials = references.specials;
	}

	alias ( keypath ) {
		var alias;
		if ( alias = this.aliases[ keypath ] ) {
			return alias;
		}
		return keypath;
	}

	getKeypath () {
		return this.context.getKeypath();
	}

	get () {
		return this.context.get();
	}

	join ( keypath ) {
		return this.context.join( this.alias( keypath ) );
	}

	tryJoin ( keypath ) {
		return this.context.tryJoin( this.alias( keypath ) );
	}

	register ( method, dependant ) {
		return this.context.register( method, dependant );
	}

	unregister ( method, dependant ) {
		return this.context.unregister( method, dependant );
	}

	addWatcher ( key, resolve ) {
		return this.context.addWatcher( key, resolve );
	}


}

export default AliasWrapper;
