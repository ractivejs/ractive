import matches from 'utils/matches';

export default function Fragment$find ( selector ) {
	var i, len, item, node, queryResult;

	if ( this.nodes ) {
		len = this.nodes.length;
		for ( i = 0; i < len; i += 1 ) {
			node = this.nodes[i];

			// we only care about elements
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

	if ( this.items ) {
		len = this.items.length;
		for ( i = 0; i < len; i += 1 ) {
			item = this.items[i];

			if ( item.find && ( queryResult = item.find( selector ) ) ) {
				return queryResult;
			}
		}

		return null;
	}
}
