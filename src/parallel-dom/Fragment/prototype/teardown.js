export default function Fragment$teardown () {
	this.items.forEach( i => i.teardown() );
}
