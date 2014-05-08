import teardown from 'shared/teardown';

export default function Triple$teardown ( destroy ) {
	if ( destroy ) {
		this.detach();
		this.docFrag = this.nodes = null;
	}

	teardown( this );
}
