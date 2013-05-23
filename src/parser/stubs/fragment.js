(function ( stubs ) {

	var FragmentStub;

	stubs.fragment = function ( parser, priority, preserveWhitespace ) {
		return new FragmentStub( parser, priority, preserveWhitespace );
	};


	FragmentStub = function ( parser, priority, preserveWhitespace ) {
		var items, item;

		items = this.items = [];

		item = stubs.item( parser, priority, preserveWhitespace );
		while ( item !== null ) {
			items[ items.length ] = item;
			item = stubs.item( parser, priority, preserveWhitespace );
		}
	};

	FragmentStub.prototype = {
		toJson: function ( noStringify ) {
			var json = stubUtils.jsonify( this.items, noStringify );
			return json;
		},

		toString: function () {
			var str = stubUtils.stringify( this.items );
			return str;
		}
	};

}( stubs ));