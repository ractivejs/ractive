import findIndexRefs from 'virtualdom/items/shared/Resolvers/findIndexRefs';

export default function( node ) {
	var info = {}, priv, indices;

	if ( !node || !( priv = node._ractive ) ) {
		return info;
	}

	info.ractive = priv.root;
	info.keypath = priv.keypath.str;
	info.index = {};

	// find all index references and resolve them
	if ( indices = findIndexRefs( priv.proxy.parentFragment ) ) {
		info.index = findIndexRefs.resolve( indices );
	}

	return info;
}
