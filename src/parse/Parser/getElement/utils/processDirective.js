define([
	'config/types',
	'utils/parseJSON',
	'parse/Parser/getStringFragment/_getStringFragment'
], function (
	types,
	parseJSON,
	getStringFragment
) {

	'use strict';

	// TODO clean this up, it's shocking
	return function ( directive ) {
		var result, tokens, token, colonIndex, directiveName, directiveArgs, parsed;

		if ( !directive.name || !directive.value ) {
			throw new Error( 'Illegal directive' );
		}

		result = { type: directive.name };

		tokens = directive.value;

		directiveName = [];
		directiveArgs = [];

		while ( tokens.length ) {
			token = tokens.shift();

			if ( token.type === types.TEXT ) {
				colonIndex = token.value.indexOf( ':' );

				if ( colonIndex === -1 ) {
					directiveName.push( token );
				} else {

					// is the colon the first character?
					if ( colonIndex ) {
						// no
						directiveName.push({
							type: types.TEXT,
							value: token.value.substr( 0, colonIndex )
						});
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
				directiveName.push( token );
			}
		}

		directiveArgs = directiveArgs.concat( tokens );

		if ( directiveName.length === 1 && directiveName[0].type === types.TEXT ) {
			directiveName = directiveName[0].value;
		} else {
			directiveName = getStringFragment( directiveName );
		}

		if ( directiveArgs.length || typeof directiveName !== 'string' ) {
			result.value = {
				n: directiveName
			};

			if ( directiveArgs.length === 1 && directiveArgs[0].type === types.TEXT ) {
				parsed = parseJSON( '[' + directiveArgs[0].value + ']' );
				result.value.a = parsed ? parsed.value : directiveArgs[0].value;
			}

			else {
				result.value.d = getStringFragment( directiveArgs );
			}
		} else {
			result.value = directiveName;
		}

		return result;
	};

});
