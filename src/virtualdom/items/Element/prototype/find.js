import matches from 'utils/matches';

export default function ( selector ) {
	if ( !this.node ) {
		// this element hasn't been rendered yet
		return null;
	}

	if ( matches( this.node, selector ) ) {
		return this.node;
	}

	if ( this.fragment && this.fragment.find ) {
		return this.fragment.find( selector );
	}
}
