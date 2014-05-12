export default function Fragment$bubble () {
	this.dirtyValue = this.dirtyArgs = true;

	if ( this.inited && this.owner.bubble ) {
		this.owner.bubble();
	}
}
