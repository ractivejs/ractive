export default function( node ) {
	var info = {}, priv;

	if ( !node || !( priv = node._ractive ) ) {
		return info;
	}

	info.ractive = priv.root;
	info.keypath = priv.keypath;
	info.index = priv.index;

	return info;
}
