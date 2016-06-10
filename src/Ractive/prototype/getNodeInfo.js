import staticInfo from '../static/getNodeInfo';

export default function getNodeInfo( node ) {
	if ( typeof node === 'string' ) {
		node = this.find( node );
	}

	return staticInfo( node );
}
