export default class Text {
	constructor ( str ) {
		this.str = str;
	}

	bind () {
		// noop
	}

	render () {
		return ( this.node = document.createTextNode( this.str ) );
	}

	toString () {
		return this.str;
	}

	unbind () {
		// noop
	}

	update () {
		// noop
	}
}
