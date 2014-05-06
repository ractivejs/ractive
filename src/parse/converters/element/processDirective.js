import parseJSON from 'utils/parseJSON';

// TODO clean this up, it's shocking
export default function ( tokens ) {
    var result, token, colonIndex, directiveName, directiveArgs, parsed;

    if ( typeof tokens === 'string' ) {
        if ( tokens.indexOf( ':' ) === -1 ) {
            return tokens;
        }

        tokens = [ tokens ];
    }

    result = {};

    directiveName = [];
    directiveArgs = [];

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

    if ( directiveArgs.length || typeof directiveName !== 'string' ) {
        result = {
            // TODO is this really necessary? just use the array
            n: ( directiveName.length === 1 && typeof directiveName[0] === 'string' ? directiveName[0] : directiveName )
        };

        if ( directiveArgs.length === 1 && typeof directiveArgs[0] === 'string' ) {
            parsed = parseJSON( '[' + directiveArgs[0] + ']' );
            result.a = parsed ? parsed.value : directiveArgs[0];
        }

        else {
            result.d = directiveArgs;
        }
    } else {
        result = directiveName;
    }

    return result;
}
