export default function isDebug() {
	return this.debug || isStaticDebug( this.constructor );
}

function isStaticDebug( constructor ) {
	if ( !constructor ) { return false; }
	return constructor.debug || isStaticDebug( constructor._parent );
}
