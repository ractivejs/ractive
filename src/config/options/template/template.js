import parser from 'config/options/template/parser';
import isObject from 'utils/isObject';

var templateConfig = {
	name: 'template',
	extend: extend,
	init: init,
	reset: reset,
	processCompound: processCompound
};

function extend ( Parent, proto, options ) {

	// only assign if exists
	if ( options && 'template' in options ) {
		proto.template = parseTemplate( proto, options.template, true );
	}
}

function init ( Parent, ractive, options ) {

	var result, option = options ? options.template : void 0;

	result = parseTemplate( ractive, option || Parent.prototype.template );

	if ( typeof result === 'function' ) {

		let fn = result;

		result = getDynamicTemplate( ractive, fn );

		// store fn and fn result for reset
		ractive._config[ this.name ] = {
			fn: fn,
			result: result
		};

		result = parseTemplate( ractive, result );
	}

	if ( result ) {
		ractive.template = result;
	}
}

function reset ( ractive ) {

	var result = resetValue( ractive );

	if ( result ) {
		ractive.template = parseTemplate( ractive, result );
		return true;
	}

}

function resetValue ( ractive ) {

	var initial = ractive._config.template, result;

	// is this dynamic template?
	if( !initial || !initial.fn) { return; }

	result = getDynamicTemplate ( ractive, initial.fn );

	result = parseTemplate( ractive, result );

	// compare results of fn return, which is likely
	// be string comparison ( not yet parsed )
	if ( result !== initial.result ) {
		initial.result = result;
		return result;
	}

}

function getDynamicTemplate ( ractive, fn ) {
	var helper = parser.createHelper( parser.getParseOptions( ractive ) );
	return fn.call( ractive, ractive.data, helper );
}


function parseTemplate ( target, template, isExtend ) {

	if ( !template || typeof template === 'function' ) { return template; }

	if ( !parser.isParsed( template ) ) {

		// Assume this is an ID of a <script type='text/ractive'> tag
		if ( parser.isHashedId( template ) ) {
			template = parser.fromId( template );
		}

		template = parser.parse( template, parser.getParseOptions( target ) );
	}

	template = processCompound( target, template, isExtend );

	// If the template was an array with a single string member, that means
	// we can use innerHTML - we just need to unpack it
	if ( template && ( template.length === 1 ) && ( typeof template[0] === 'string' ) ) {
		template = template[0];
	}

	return template;
}

function processCompound( target, template, isExtend ) {

	if ( !isObject( template ) ) { return template; }

	if( isExtend ) { target = target.constructor; }

	//target.partials = target.partials || {};

	for ( let key in template.partials ) {
		target.partials[ key ] = template.partials[ key ];
	}

	return template.main;
}

export default templateConfig;
