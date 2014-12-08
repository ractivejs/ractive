export default function Component$findComponent ( selector, options ) {
	if ( !selector || ( selector === this.name ) ) {
		if ( !options.where || options.where( this.instance ) ) {
			return this.instance;
		}
	}

	if ( this.instance.fragment ) {
		return this.instance.fragment.findComponent( selector, options );
	}

	return null;
}
