import { doc } from '../../../../config/environment';
import parse from '../../../../parse/_parse';
import { create } from '../../../../utils/object';
import { fatal } from '../../../../utils/log';
import createFunction from '../../../../parse/utils/createFunction';

const parseOptions = [
	'preserveWhitespace',
	'sanitize',
	'stripComments',
	'delimiters',
	'tripleDelimiters',
	'staticDelimiters',
	'staticTripleDelimiters',
	'interpolate'
];

const parser = {
	fromId, isHashedId, isParsed, getParseOptions, createHelper,
	parse: doParse,
	createFunction: doCreateFunction
};

function createHelper ( parseOptions ) {
	const helper = create( parser );
	helper.parse = ( template, options ) => doParse( template, options || parseOptions );
	return helper;
}

function throwNoParse ( method, error ) {
	if ( !method ) {
		fatal( `Missing Ractive.parse - cannot parse ${error}. Either preparse or use the version that includes the parser` );
	}
}

function doParse ( template, parseOptions ) {
	throwNoParse( parse, 'template' );
	return parse( template, parseOptions || this.options );
}

function doCreateFunction ( body, length ) {
	throwNoParse( createFunction, 'new expression functions' );
	return createFunction( body, length );
}

function fromId ( id, options ) {
	if ( !doc ) {
		if ( options && options.noThrow ) { return; }
		throw new Error( `Cannot retrieve template #${id} as Ractive is not running in a browser.` );
	}

	if ( isHashedId( id ) ) id = id.substring( 1 );

	let template;

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
