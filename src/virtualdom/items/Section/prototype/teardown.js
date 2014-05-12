import teardown from 'virtualdom/items/shared/teardown';

export default function Section$teardown () {
	this.fragments.splice( 0 ).forEach( f => f.teardown() );
	teardown.call( this );
}
