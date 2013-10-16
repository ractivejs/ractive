var FragmentStub = function ( parser, preserveWhitespace ) {
	var items, item;

	items = this.items = [];

	item = getItem( parser, preserveWhitespace );
	while ( item !== null ) {
		items[ items.length ] = item;
		item = getItem( parser, preserveWhitespace );
	}
};

FragmentStub.prototype = {
	toJSON: function ( noStringify ) {
		var json;

		if ( this[ 'json_' + noStringify ] ) {
			return this[ 'json_' + noStringify ];
		}

		json = this[ 'json_' + noStringify ] = jsonifyStubs( this.items, noStringify );
		return json;
	},

	toString: function () {
		if ( this.str !== undefined ) {
			return this.str;
		}

		this.str = stringifyStubs( this.items );
		return this.str;
	}
};