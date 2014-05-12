import detachNode from 'utils/detachNode';

export default function Triple$unrender ( shouldDestroy ) {
	if ( shouldDestroy ) {
		this.nodes.forEach( detachNode );
	}

	// TODO update live queries
}
