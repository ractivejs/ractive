export default function Section$findAll ( selector, query ) {
	var i, len;

	len = this.fragments.length;
	for ( i = 0; i < len; i += 1 ) {
		this.fragments[i].findAll( selector, query );
	}
}
