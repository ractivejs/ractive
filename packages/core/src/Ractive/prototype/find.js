export default function Ractive$find ( selector, options = {} ) {
	if ( !this.el ) throw new Error( `Cannot call ractive.find('${selector}') unless instance is rendered to the DOM` );

	let node = this.fragment.find( selector, options );
	if ( node ) return node;

	if ( options.remote ) {
		for ( let i = 0; i < this._children.length; i++ ) {
			if ( !this._children[i].instance.fragment.rendered ) continue;
			node = this._children[i].instance.find( selector, options );
			if ( node ) return node;
		}
	}
}
