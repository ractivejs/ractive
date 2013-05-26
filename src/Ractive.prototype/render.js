// Render instance to element specified here or at initialization
proto.render = function ( options ) {
	var el = ( options.el ? getEl( options.el ) : this.el );

	if ( !el ) {
		throw new Error( 'You must specify a DOM element to render to' );
	}

	// Clear the element, unless `append` is `true`
	if ( !options.append ) {
		el.innerHTML = '';
	}

	if ( options.callback ) {
		this.callback = options.callback;
	}

	// Render our *root fragment*
	this.rendered = new DomFragment({
		descriptor: this.template,
		root: this,
		owner: this, // saves doing `if ( this.parent ) { /*...*/ }` later on
		parentNode: el
	});

	// if we have any deferred attributes or evaluators, update them now
	while ( this._def.length ) {
		this._def.pop().update().deferred = false;
	}

	el.appendChild( this.rendered.docFrag );
};