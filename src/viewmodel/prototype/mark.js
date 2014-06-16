export default function Viewmodel$mark ( keypath ) {
	if ( this.changes.indexOf( keypath ) === -1 ) {
		this.changes.push( keypath );
		this.clearCache( keypath );
	}
}
