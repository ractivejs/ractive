export default function Viewmodel$init () {
	var key;

	for ( key in this.computations ) {
		this.computations[ key ].init( this );
	}
}