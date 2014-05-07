export default function Fragment$bubble () {
	this.dirtyValue = this.dirtyArgs = true;

	// TODO remove this check?
	if ( this.owner.bubble ) {
		this.owner.bubble();
	}
}
