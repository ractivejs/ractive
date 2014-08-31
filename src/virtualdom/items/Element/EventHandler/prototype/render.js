export default function EventHandler$render () {
	this.node = this.element.node;
	// store this on the node itself, so it can be retrieved by a
	// universal handler
	this.node._ractive.events[ this.name ] = this;

	if ( this.method || this.getAction() ) {
		this.listen();
	}
}
