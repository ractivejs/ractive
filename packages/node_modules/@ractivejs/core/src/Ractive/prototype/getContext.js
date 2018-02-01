import staticContext, { getNodeInfo as staticInfo } from '../static/getContext';

export default function getContext ( node, options ) {
	if ( typeof node === 'string' ) {
		node = this.find( node, options );
	}

	return staticContext( node );
}

export function getNodeInfo ( node, options ) {
	if ( typeof node === 'string' ) {
		node = this.find( node, options );
	}

	return staticInfo( node );
}
