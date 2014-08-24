export default function EventHandler$bubble () {
	var hasAction = this.getAction();

	if( hasAction && !this.hasListener ) {
		this.listen();
	}
	else if ( !hasAction && this.hasListener ) {
		this.unrender();
	}
}
