export default function cleanup () {
	if ( fixture.__ractive_instances__ ) {
		fixture.__ractive_instances__.forEach( ractive => {
			ractive.transitionsEnabled = false;
			ractive.teardown();
		});
	}
}
