export default function Component$firstNode () {
	if ( this.rendered ) {
		return this.instance.fragment.firstNode();
	}

	return null;
}
