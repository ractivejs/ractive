import { matches } from 'utils/dom';

export default function Triple$find ( selector ) {
	var i, len, node, queryResult;

	len = this.nodes.length;
	for ( i = 0; i < len; i += 1 ) {
		node = this.nodes[i];

		if ( node.nodeType !== 1 ) {
			continue;
		}

		if ( matches( node, selector ) ) {
			return node;
		}

		if ( queryResult = node.querySelector( selector ) ) {
			return queryResult;
		}
	}

	return null;
}
