export default function Fragment$unrender ( shouldDestroy ) {
	if ( !this.rendered ) {
		throw new Error( 'Attempted to unrender a fragment that was not rendered' );
	}

	this.items.forEach( i => i.unrender( shouldDestroy ) );
	this.rendered = false;
}
