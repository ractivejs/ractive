// The pop, push, shift an unshift methods can all be represented
// as an equivalent splice
export default function getSpliceEquivalent ( length, methodName, args ) {
	switch ( methodName ) {
		case 'splice':
			// use start of array if not provided
			if ( args[0] == null ) {
				args[0] = 0;
			}
			else {
				// Not sure what this one is trying to do...
				if ( args[0] < 0 ) {
					args[0] = length + Math.max( args[0], -length );
				}
				// Shouldn't be longer than the array
				else if ( args[0] > length ) {
					args[0] = length;
				}
			}

			if ( args[1] == null ) {
				args[1] = 0;
			}
			// ensure we only remove elements that exist
			else {
				args[1] = Math.min( args[1], Math.max( length - args[0], 0 ) );
			}

			return args;

		case 'sort':
		case 'reverse':
			return null;

		case 'pop':
			if ( length ) {
				return [ length - 1, 1 ];
			}
			return [ 0, 0 ];

		case 'push':
			return [ length, 0 ].concat( args );

		case 'shift':
			return [ 0, length ? 1 : 0 ];

		case 'unshift':
			return [ 0, 0 ].concat( args );
	}
}
