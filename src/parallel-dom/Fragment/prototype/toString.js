export default function Fragment$toString () {
	if ( !this.items ) {
		return '';
	}

	return this.items.join( '' );
}
