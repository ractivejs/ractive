export default function Fragment$teardown ( destroy ) {
	while ( this.items.length ) {
		this.items.pop().teardown( destroy );
	}

	this.items = this.docFrag = null;
}
