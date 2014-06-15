export default function Viewmodel$mark ( keypath ) {
	if ( !this.changes[ keypath ] ) {
		this.changes[ keypath ] = true;
		this.changes.push( keypath );

		this.clearCache( keypath );
	}
}
