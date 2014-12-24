import { matches } from 'utils/dom';

export default function Triple$findAll ( selector, queryResult ) {
	var i, len, node, queryAllResult, numNodes, j;

	len = this.nodes.length;
	for ( i = 0; i < len; i += 1 ) {
		node = this.nodes[i];

		if ( node.nodeType !== 1 ) {
			continue;
		}

		if ( matches( node, selector ) ) {
			queryResult.push( node );
		}

		if ( queryAllResult = node.querySelectorAll( selector ) ) {
			numNodes = queryAllResult.length;
			for ( j = 0; j < numNodes; j += 1 ) {
				queryResult.push( queryAllResult[j] );
			}
		}
	}
}
