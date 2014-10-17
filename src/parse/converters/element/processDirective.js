import Parser from 'parse/Parser/_Parser';
import conditional from 'parse/Parser/expressions/conditional';
import flattenExpression from 'parse/Parser/utils/flattenExpression';
import parseJSON from 'utils/parseJSON';

var methodCallPattern = /^([a-zA-Z_$][a-zA-Z_$0-9]*)\(/,
	ExpressionParser;

ExpressionParser = Parser.extend({
	converters: [ conditional ]
});

// TODO clean this up, it's shocking
export default function ( tokens ) {
	var result,
		match,
		parser,
		args,
		token,
		colonIndex,
		directiveName,
		directiveArgs,
		parsed;

	if ( typeof tokens === 'string' ) {
		if ( match = methodCallPattern.exec( tokens ) ) {
			result = { m: match[1] };
			args = '[' + tokens.slice( result.m.length + 1, -1 ) + ']';

			parser = new ExpressionParser( args );
			result.a = flattenExpression( parser.result[0] );

			return result;
		}

		if ( tokens.indexOf( ':' ) === -1 ) {
			return tokens.trim();
		}

		tokens = [ tokens ];
	}

	result = {};

	directiveName = [];
	directiveArgs = [];

	if ( tokens) {
		while ( tokens.length ) {
			token = tokens.shift();

			if ( typeof token === 'string' ) {
				colonIndex = token.indexOf( ':' );

				if ( colonIndex === -1 ) {
					directiveName.push( token );
				} else {

					// is the colon the first character?
					if ( colonIndex ) {
						// no
						directiveName.push( token.substr( 0, colonIndex ) );
					}

					// if there is anything after the colon in this token, treat
					// it as the first token of the directiveArgs fragment
					if ( token.length > colonIndex + 1 ) {
						directiveArgs[0] = token.substring( colonIndex + 1 );
					}

					break;
				}
			}

			else {
				directiveName.push( token );
			}
		}

		directiveArgs = directiveArgs.concat( tokens );
	}

	if ( !directiveName.length ) {
		result = '';
	}
	else if ( directiveArgs.length || typeof directiveName !== 'string' ) {
		result = {
			// TODO is this really necessary? just use the array
			n: ( directiveName.length === 1 && typeof directiveName[0] === 'string' ? directiveName[0] : directiveName )
		};

		if ( directiveArgs.length === 1 && typeof directiveArgs[0] === 'string' ) {
			parsed = parseJSON( '[' + directiveArgs[0] + ']' );
			result.a = parsed ? parsed.value : directiveArgs[0].trim();
		}

		else {
			result.d = directiveArgs;
		}
	} else {
		result = directiveName;
	}

	return result;
}
