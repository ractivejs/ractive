export default function Ractive$findComponent ( selector ) {
	const child = this.fragment.findComponent( selector );
	if ( child ) return child;

	if ( !selector && this._children.length ) return this._children[0].instance;
	for ( let i = 0; i < this._children.length; i++ ) {
		// skip children that are or should be in an anchor
		if ( this._children[i].target ) continue;
		if ( this._children[i].name === selector ) return this._children[i].instance;
	}
}
