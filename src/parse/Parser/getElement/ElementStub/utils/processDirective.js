define([ 'config/types', 'utils/parseJSON' ], function ( types, parseJSON ) {

	'use strict';

	return function ( directive ) {
		var processed, tokens, token, colonIndex, throwError, directiveName, directiveArgs, parsed, item;

		throwError = function () {
			throw new Error( 'Illegal directive' );
		};

		if ( !directive.name || !directive.value ) {
			throwError();
		}

		processed = { directiveType: directive.name };

		tokens = directive.value;

		directiveName = [];
		directiveArgs = [];

		while ( tokens.length ) {
			token = tokens.shift();

			if ( token.type === types.TEXT ) {
				colonIndex = token.value.indexOf( ':' );

				if ( colonIndex === -1 ) {
					directiveName[ directiveName.length ] = token;
				} else {

					// is the colon the first character?
					if ( colonIndex ) {
						// no
						directiveName[ directiveName.length ] = {
							type: types.TEXT,
							value: token.value.substr( 0, colonIndex )
						};
					}

					// if there is anything after the colon in this token, treat
					// it as the first token of the directiveArgs fragment
					if ( token.value.length > colonIndex + 1 ) {
						directiveArgs[0] = {
							type: types.TEXT,
							value: token.value.substring( colonIndex + 1 )
						};
					}

					break;
				}
			}

			else {
				directiveName[ directiveName.length ] = token;
			}
		}

		directiveArgs = directiveArgs.concat( tokens );

		if ( directiveName.length === 1 && directiveName[0].type === types.TEXT ) {
			processed.name = directiveName[0].value;
		} else {
			processed.name = directiveName;
		}

		if ( directiveArgs.length ) {
			if ( directiveArgs.length === 1 && directiveArgs[0].type === types.TEXT ) {
				parsed = parseJSON( '[' + directiveArgs[0].value + ']' );

				processed.args = parsed ? parsed.v : directiveArgs[0].value;
			}

			else {
				// need to wrap args in [] brackets so they are parsed
				// as an array of arguments
				item = directiveArgs[0];
				if ( item.type === types.TEXT ) {
					item.value = '[' + item.value;
				} else {
					directiveArgs.unshift({
						type: types.TEXT,
						value: '['
					});
				}

				item = directiveArgs[ directiveArgs.length - 1 ];
				if ( item.type === types.TEXT ) {
					item.value += ']';
				} else {
					directiveArgs.push({
						type: types.TEXT,
						value: ']'
					});
				}

				processed.dynamicArgs = directiveArgs;
			}
		}

		return processed;
	};

});