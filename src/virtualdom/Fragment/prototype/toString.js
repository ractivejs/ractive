export default function Fragment$toString ( escape ) {
	if ( !this.items ) {
		return '';
	}

	return this.items.map( function ( item ) {
		return item.toString( escape );
	}).join( '' );
}
