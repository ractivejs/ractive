export default function Section$teardownFragments ( destroy ) {
	var fragment;

	while ( fragment = this.fragments.shift() ) {
		fragment.teardown( destroy );
	}
}
