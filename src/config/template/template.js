import itemConfig from 'config/itemConfiguration';
import createParser from 'config/template/parser';
import isObject from 'utils/isObject';

var templateConfig, parseOptionKeys;

templateConfig = itemConfig({
	name: 'template',
	useDefaults: true,
	defaultValue: '',
	extend: extend,
	postExtend: parseTemplate,
	init: initialise,
	postInit: parseTemplate,
	reset: reset
});

parseOptionKeys = [ 'sanitize', 'stripComments', 'delimiters', 'tripleDelimiters' ];


function extend ( target, parentValue, value ) {

	if ( typeof value === 'undefined' ) { value = parentValue; }

	return value;
}

function initialise ( ractive, parentValue, value ) {

	var result = extend( ractive, parentValue, value );

	if ( typeof result === 'function' ) {

		let fn = result;

		result = getDynamicTemplate( ractive, fn );

		// store fn and fn result for reset
		ractive._config[ this.name ] = {
			fn: fn,
			result: result
		};
	}

	return result;
}

function getDynamicTemplate ( ractive, fn ) {
	var parser = createParser( getParseOptions( ractive ) )
	return fn.call( ractive, ractive.data, parser );
}

function reset ( ractive ) {

	var initial = ractive._config.template, result;

	// is this dynamic template?
	if( !initial || !initial.fn) { return; }

	result = getDynamicTemplate ( ractive, initial.fn )

	// compare results of fn return, whihc is likely
	// be string comparison ( not yet parses ) and
	// more likely to tell if changed
	if ( result !== initial.result ) {
		initial.result = result;
		return result;
	}
}

function getParseOptions ( target ) {

	if ( target.parseOptions ) { return target.parseOptions; }

	var options = target.defaults;

	if ( !options ) { return; }

	return parseOptionKeys.reduce( ( val, option ) => {
		val[ option ] = options[ option ];
		return val;
	}, {});
}

function parseTemplate ( target, template ) {

	var parser = createParser( getParseOptions( target ) );

	if ( !parser.isParsed( template ) ) {

		// Assume this is an ID of a <script type='text/ractive'> tag
		if ( parser.isHashedId( template ) ) {
			template = parser.fromId( template );
		}

		template = parser.parse( template );
	}

	// deal with compound template
	if ( isObject( template ) ) {
		let temp = template;
		template = temp.main;

		//todo: see if we can use config.partials.extend...
		target._templatePartials = temp.partials;
		// if( temp.partials && temp.partials.length ) {
		// 	config.extend( target, target, temp.partials );
		// }
	}

	// If the template was an array with a single string member, that means
	// we can use innerHTML - we just need to unpack it
	if ( template && ( template.length === 1 ) && ( typeof template[0] === 'string' ) ) {
		template = template[0];
	}

	return template;
}

export default templateConfig;
