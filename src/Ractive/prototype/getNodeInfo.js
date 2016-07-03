import staticInfo from '../static/getNodeInfo';

export default function getNodeInfo( node, options ) {
	if ( typeof node === 'string' ) {
		node = this.find( node, options );
	}

	return staticInfo( node );
}
