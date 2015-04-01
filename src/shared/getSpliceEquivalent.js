// The pop, push, shift an unshift methods can all be represented
// as an equivalent splice
export default function getSpliceEquivalent ( length, methodName, args ) {
	switch ( methodName ) {
		case 'splice':
			if ( args[0] !== undefined && args[0] < 0 ) {
				args[0] = length + Math.max( args[0], -length );
			}

			while ( args.length < 2 ) {
				args.push( 0 );
			}

			// ensure we only remove elements that exist
			args[1] = Math.min( args[1], length - args[0] );

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
