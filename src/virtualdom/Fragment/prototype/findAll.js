import matches from 'utils/matches';

export default function Fragment$findAll ( selector, query ) {
	var i, len, item, node, queryAllResult, numNodes, j;

	if ( this.nodes ) {
		len = this.nodes.length;
		for ( i = 0; i < len; i += 1 ) {
			node = this.nodes[i];

			// we only care about elements
			if ( node.nodeType !== 1 ) {
				continue;
			}

			if ( matches( node, selector ) ) {
				query.push( node );
			}

			if ( queryAllResult = node.querySelectorAll( selector ) ) {
				numNodes = queryAllResult.length;
				for ( j = 0; j < numNodes; j += 1 ) {
					query.push( queryAllResult[j] );
				}
			}
		}
	}

	else if ( this.items ) {
		len = this.items.length;
		for ( i = 0; i < len; i += 1 ) {
			item = this.items[i];

			if ( item.findAll ) {
				item.findAll( selector, query );
			}
		}
	}

	return query;
}
