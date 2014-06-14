import errors from 'config/errors';
import isClient from 'config/isClient';
import parse from 'parse/_parse';
import create from 'utils/create';
import parseOptions from 'config/options/groups/parseOptions';

var parser = {
	parse: doParse,
	fromId: fromId,
	isHashedId: isHashedId,
	isParsed: isParsed,
	getParseOptions: getParseOptions,
	createHelper: createHelper
}

function createHelper ( parseOptions ) {
	var helper = create( parser );
	helper.parse = function( template, options ){
		return doParse( template, options || parseOptions );
	}
	return helper;
}

function doParse ( template, parseOptions ) {
	if ( !parse ) {
		throw new Error( errors.missingParser );
	}

	return parse( template, parseOptions || this.options );
}

function fromId ( id, options ) {
	var template;

	if ( !isClient ) {
		if ( options && options.noThrow ) { return; }
		throw new Error('Cannot retieve template #' + id + 'as Ractive is not running in the client.');
	}

	if ( isHashedId( id ) ) {
		id = id.substring( 1 );
	}

	if ( !( template = document.getElementById( id ) )) {
		if ( options && options.noThrow ) { return; }
		throw new Error( 'Could not find template element with id #' + id );
	}

	// Do we want to turn this on?
	/*
	if ( template.tagName.toUpperCase() !== 'SCRIPT' )) {
		if ( options && options.noThrow ) { return; }
		throw new Error( 'Template element with id #' + id + ', must be a <script> element' );
	}
	*/

	return template.innerHTML;

}

function isHashedId ( id ) {
	return ( id.charAt( 0 ) === '#' );
}

function isParsed ( template) {
	return !( typeof template === 'string' );
}

function getParseOptions ( ractive ) {

	// Could be Ractive or a Component
	if ( ractive.defaults ) { ractive = ractive.defaults; }

	return parseOptions.reduce( ( val, option ) => {
		val[ option.name ] = ractive[ option.name ];
		return val;
	}, {} );

}

export default parser;



