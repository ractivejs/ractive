export default class ShadowResolver {
	constructor ( fragment, callback ) {
		while ( !fragment.context ) {
			fragment = fragment.parent;
		}

		// TODO link this up so the callback is called
		// whenever the fragment changes context, (in some situations
		// it may not be possible for the fragment to change)
		callback( fragment.context );
	}
}
