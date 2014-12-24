import { create } from 'utils/object';
import parser from './parser';
import parse from 'parse/_parse';

var templateConfigurator = {
	name: 'template',

	extend: function extend ( Parent, proto, options ) {
		var template;

		// only assign if exists
		if ( 'template' in options ) {
			template = options.template;

			if ( typeof template === 'function' ) {
				proto.template = template;
			} else {
				proto.template = parseIfString( template, proto );
			}
		}
	},

	init: function init ( Parent, ractive, options ) {
		var template, fn;

		// TODO because of prototypal inheritance, we might just be able to use
		// ractive.template, and not bother passing through the Parent object.
		// At present that breaks the test mocks' expectations
		template = 'template' in options ? options.template : Parent.prototype.template;

		if ( typeof template === 'function' ) {
			fn = template;
			template = getDynamicTemplate( ractive, fn );

			ractive._config.template = {
				fn: fn,
				result: template
			};
		}

		template = parseIfString( template, ractive );

		// TODO the naming of this is confusing - ractive.template refers to [...],
		// but Component.prototype.template refers to {v:1,t:[],p:[]}...
		// it's unnecessary, because the developer never needs to access
		// ractive.template
		ractive.template = template.t;

		if ( template.p ) {
			extendPartials( ractive.partials, template.p );
		}
	},

	reset: function ( ractive ) {
		var result = resetValue( ractive ), parsed;

		if ( result ) {
			parsed = parseIfString( result, ractive );

			ractive.template = parsed.t;
			extendPartials( ractive.partials, parsed.p, true );

			return true;
		}
	}
};

function resetValue ( ractive ) {
	var initial = ractive._config.template, result;

	// If this isn't a dynamic template, there's nothing to do
	if ( !initial || !initial.fn ) {
		return;
	}

	result = getDynamicTemplate( ractive, initial.fn );

	// TODO deep equality check to prevent unnecessary re-rendering
	// in the case of already-parsed templates
	if ( result !== initial.result ) {
		initial.result = result;
		result = parseIfString( result, ractive );
		return result;
	}
}

function getDynamicTemplate ( ractive, fn ) {
	var helper = createHelper( parser.getParseOptions( ractive ) );
	return fn.call( ractive, ractive.data, helper );
}

function createHelper ( parseOptions ) {
	var helper = create( parser );
	helper.parse = function ( template, options ){
		return parser.parse( template, options || parseOptions );
	};
	return helper;
}

function parseIfString ( template, ractive ) {
	if ( typeof template === 'string' ) {
		// ID of an element containing the template?
		if ( template[0] === '#' ) {
			template = parser.fromId( template );
		}

		template = parse( template, parser.getParseOptions( ractive ) );
	}

	// Check we're using the correct version
	else if ( template.v !== 2 ) {
		throw new Error( 'Mismatched template version! Please ensure you are using the latest version of Ractive.js in your build process as well as in your app' );
	}

	return template;
}

function extendPartials ( existingPartials, newPartials, overwrite ) {
	if ( !newPartials ) return;

	// TODO there's an ambiguity here - we need to overwrite in the `reset()`
	// case, but not initially...

	for ( let key in newPartials ) {
		if ( overwrite || !existingPartials.hasOwnProperty( key ) ) {
			existingPartials[ key ] = newPartials[ key ];
		}
	}
}

export default templateConfigurator;
