// This function returns an array of arguments that you'd pass to
// array.splice(...) in order to simulate a push/pop/shift/unshift operation

export default function ( array, methodName, args ) {
	switch ( methodName ) {
		case 'splice':
			if ( args[0] !== undefined && args[0] < 0 ) {
				args[0] = array.length + Math.max( args[0], -array.length );
			}

			while ( args.length < 2 ) {
				args.push( 0 );
			}

			// ensure we only remove elements that exist
			args[1] = Math.min( args[1], array.length - args[0] );

			return args;

		case 'sort':
		case 'reverse':
			return null;

		case 'pop':
			if ( array.length ) {
				return [ array.length - 1, 1 ];
			}
			return null;

		case 'push':
			return [ array.length, 0 ].concat( args );

		case 'shift':
			return [ 0, 1 ];

		case 'unshift':
			return [ 0, 0 ].concat( args );
	}
}
