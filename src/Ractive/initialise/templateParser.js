define([
	'config/errors',
	'config/isClient',
	'parse/_parse'
], function (
	errors,
	isClient,
	parse
) {

	'use strict';

	return function ( options ) {
		
		return {
			fromId: function ( id ) {
				var template;
				if ( !isClient ) {
					throw new Error('Cannot retieve template #' + id + 'as Ractive is not running in the client.');
				}

				if ( id.charAt( 0 ) === '#' ) {
					id = id.substring( 1 );
				}

				if ( !( template = document.getElementById( id ) )) {
					throw new Error( 'Could not find template element with id #' + id );
				}	

				return template.innerHTML;			

			},
			parse: function ( template, parseOptions ) {
				if ( !parse ) {
					throw new Error( errors.missingParser );
				}
				return parse( template, parseOptions || options );
			},
			isParsed: function ( template) {
				return !( typeof template === 'string' );
			} 
		};
	};

});
