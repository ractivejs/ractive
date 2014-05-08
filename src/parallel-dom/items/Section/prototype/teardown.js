import teardown from 'shared/teardown';

export default function Section$teardown ( destroy ) {
	this.teardownFragments( destroy );
	teardown( this );
}
