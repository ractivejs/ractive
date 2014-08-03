export default function Fragment$getNode () {
	var fragment = this;

	do  {
		if ( fragment.pElement ) {
			return fragment.pElement.node;
		}
	} while ( fragment = fragment.parent );

	return this.root.detached || this.root.el;
}
