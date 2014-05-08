export default function Fragment$bubble () {
	this.dirtyValue = this.dirtyArgs = true;

	// TODO remove this check?
	if ( this.inited && this.owner.bubble ) {
		this.owner.bubble();
	}
}
