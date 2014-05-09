export default function Element$getAttribute ( name ) {
	if ( !this.attributes || !this.attributes[ name ] ) {
		return;
	}

	return this.attributes[ name ].value;
}
