export default function Fragment$toString ( escape ) {
	if ( !this.items ) {
		return '';
	}

	return this.items.map( escape ? toEscapedString : toString ).join( '' );
}

function toString ( item ) {
	return item.toString();
}

function toEscapedString ( item ) {
	return item.toString( true );
}