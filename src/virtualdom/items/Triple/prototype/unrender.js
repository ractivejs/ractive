import detachNode from 'utils/detachNode';

export default function Triple$unrender ( shouldDestroy ) {
	if ( this.rendered && shouldDestroy ) {
		this.nodes.forEach( detachNode );
		this.rendered = false;
	}

	// TODO update live queries
}
