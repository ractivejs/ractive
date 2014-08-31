define(function () {

	'use strict';
	
	// should this be combined with prototype/adapt.js?
	
	var configure = {
	
		lookup: function ( target, adaptors ) {
	
			var i, adapt = target.adapt;
	
			if ( !adapt || !adapt.length ) { return adapt; }
	
	
			if ( adaptors && Object.keys( adaptors ).length && ( i = adapt.length ) ) {
				while ( i-- ) {
					var adaptor = adapt[i];
	
					if ( typeof adaptor === 'string' ) {
						adapt[i] = adaptors[ adaptor ] || adaptor;
					}
				}
			}
	
			return adapt;
		},
	
		combine: function ( parent, adapt ) {
	
			// normalize 'Foo' to [ 'Foo' ]
			parent = arrayIfString( parent );
			adapt = arrayIfString( adapt );
	
			// no parent? return adapt
			if ( !parent || !parent.length) { return adapt; }
	
			// no adapt? return 'copy' of parent
			if ( !adapt || !adapt.length ) { return parent.slice(); }
	
			// add parent adaptors to options
			parent.forEach( function(a ) {
				// don't put in duplicates
				if ( adapt.indexOf( a ) === -1 ) {
					adapt.push( a );
				}
			});
	
			return adapt;
		}
	};
	
	function arrayIfString ( adapt ) {
		if ( typeof adapt === 'string' ) {
			adapt = [ adapt ];
		}
	
		return adapt;
	}
	
	return configure;

});