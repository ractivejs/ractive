export default function Ractive$findAllComponents ( selector, options ) {
	if ( !options && typeof selector === 'object' ) {
		options = selector;
		selector = '';
	}

	options = options || {};

	if ( !Array.isArray( options.result ) ) options.result = [];

	this.fragment.findAllComponents( selector, options );

	if ( options.remote ) {
		// search non-fragment children
		this._children.forEach( c => {
			if ( !c.target && c.instance.fragment && c.instance.fragment.rendered ) {
				if ( !selector || c.name === selector ) {
					options.result.push( c.instance );
				}

				c.instance.findAllComponents( selector, options );
			}
		});
	}

	return options.result;
}

