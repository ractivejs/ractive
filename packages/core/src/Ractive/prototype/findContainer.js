export default function Ractive$findContainer ( selector ) {
	if ( this.container ) {
		if ( this.container.component && this.container.component.name === selector ) {
			return this.container;
		} else {
			return this.container.findContainer( selector );
		}
	}

	return null;
}