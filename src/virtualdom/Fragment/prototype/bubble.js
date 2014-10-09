export default function Fragment$bubble () {
	this.dirtyValue = this.dirtyArgs = true;

	if ( this.bound && typeof this.owner.bubble === 'function' ) {
		this.owner.bubble();
	}
}
