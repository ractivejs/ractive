import errors from 'config/errors';
import isClient from 'config/isClient';
import parse from 'parse/_parse';

function TemplateParser( options ) {
	this.options = options;
}

TemplateParser.prototype = {
	parse: function ( template, parseOptions ) {
		if ( !parse ) {
			throw new Error( errors.missingParser );
		}

		return parse( template, parseOptions || this.options );
	},
	fromId: fromId,
	isHashedId: isHashedId,
	isParsed: isParsed
}

function fromId ( id ) {
	var template;

	if ( !isClient ) {
		throw new Error('Cannot retieve template #' + id + 'as Ractive is not running in the client.');
	}

	if ( isHashedId( id ) ) {
		id = id.substring( 1 );
	}

	if ( !( template = document.getElementById( id ) )) {
		throw new Error( 'Could not find template element with id #' + id );
	}

	return template.innerHTML;

}

function isHashedId ( id ) {
	return ( id.charAt( 0 ) === '#' );
}

function isParsed ( template) {
	return !( typeof template === 'string' );
}

export default function parser ( options ) {
	return new TemplateParser( options );
}



