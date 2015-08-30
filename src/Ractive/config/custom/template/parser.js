import { doc } from '../../../../config/environment';
import parse from '../../../../parse/_parse';
import { create } from '../../../../utils/object';

var parseOptions = [
 	'preserveWhitespace',
	'sanitize',
	'stripComments',
	'delimiters',
	'tripleDelimiters',
	'interpolate'
];

var parser = {
	fromId, isHashedId, isParsed, getParseOptions, createHelper,
	parse: doParse
};

function createHelper ( parseOptions ) {
	var helper = create( parser );
	helper.parse = ( template, options ) => doParse( template, options || parseOptions );
	return helper;
}

function doParse ( template, parseOptions ) {
	if ( !parse ) {
		throw new Error( 'Missing Ractive.parse - cannot parse template. Either preparse or use the version that includes the parser' );
	}

	return parse( template, parseOptions || this.options );
}

function fromId ( id, options ) {
	var template;

	if ( !doc ) {
		if ( options && options.noThrow ) { return; }
		throw new Error( `Cannot retrieve template #${id} as Ractive is not running in a browser.` );
	}

	if ( isHashedId( id ) ) {
		id = id.substring( 1 );
	}

	if ( !( template = doc.getElementById( id ) )) {
		if ( options && options.noThrow ) { return; }
		throw new Error( `Could not find template element with id #${id}` );
	}

	if ( template.tagName.toUpperCase() !== 'SCRIPT' ) {
		if ( options && options.noThrow ) { return; }
		throw new Error( `Template element with id #${id}, must be a <script> element` );
	}

	return ( 'textContent' in template ? template.textContent : template.innerHTML );
}

function isHashedId ( id ) {
	return ( id && id[0] === '#' );
}

function isParsed ( template) {
	return !( typeof template === 'string' );
}

function getParseOptions ( ractive ) {
	// Could be Ractive or a Component
	if ( ractive.defaults ) { ractive = ractive.defaults; }

	return parseOptions.reduce( ( val, key ) => {
		val[ key ] = ractive[ key ];
		return val;
	}, {});
}

export default parser;
