export default function Component$findComponent ( selector ) {
	if ( !selector || ( selector === this.name ) ) {
		return this.instance;
	}

	if ( this.instance.fragment ) {
		return this.instance.fragment.findComponent( selector );
	}

	return null;
}
