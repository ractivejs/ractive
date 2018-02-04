export default function Ractive$findComponent ( selector, options = {} ) {
	if ( typeof selector === 'object' ) {
		options = selector;
		selector = '';
	}

	let child = this.fragment.findComponent( selector, options );
	if ( child ) return child;

	if ( options.remote ) {
		if ( !selector && this._children.length ) return this._children[0].instance;
		for ( let i = 0; i < this._children.length; i++ ) {
			// skip children that are or should be in an anchor
			if ( this._children[i].target ) continue;
			if ( this._children[i].name === selector ) return this._children[i].instance;
			child = this._children[i].instance.findComponent( selector, options );
			if ( child ) return child;
		}
	}
}

