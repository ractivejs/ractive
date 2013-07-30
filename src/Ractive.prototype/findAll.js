proto.findAll = function ( selector ) {
	if ( !this.el ) {
		return [];
	}

	return this.el.querySelectorAll( selector );
};