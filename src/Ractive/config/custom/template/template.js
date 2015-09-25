import { TEMPLATE_VERSION } from '../../../../config/template';
import { create } from '../../../../utils/object';
import parse from '../../../../parse/_parse';
import parser from './parser';

export default {
	name: 'template',

	extend ( Parent, proto, options ) {
		// only assign if exists
		if ( 'template' in options ) {
			const template = options.template;

			if ( typeof template === 'function' ) {
				proto.template = template;
			} else {
				proto.template = parseIfString( template, proto );
			}
		}
	},

	init ( Parent, ractive, options ) {
		// TODO because of prototypal inheritance, we might just be able to use
		// ractive.template, and not bother passing through the Parent object.
		// At present that breaks the test mocks' expectations
		let template = 'template' in options ? options.template : Parent.prototype.template;
		template = template || { v: TEMPLATE_VERSION, t: [] };

		if ( typeof template === 'function' ) {
			const fn = template;
			template = getDynamicTemplate( ractive, fn );

			ractive._config.template = {
				fn,
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

	reset ( ractive ) {
		const result = resetValue( ractive );

		if ( result ) {
			const parsed = parseIfString( result, ractive );

			ractive.template = parsed.t;
			extendPartials( ractive.partials, parsed.p, true );

			return true;
		}
	}
};

function resetValue ( ractive ) {
	const initial = ractive._config.template;

	// If this isn't a dynamic template, there's nothing to do
	if ( !initial || !initial.fn ) {
		return;
	}

	let result = getDynamicTemplate( ractive, initial.fn );

	// TODO deep equality check to prevent unnecessary re-rendering
	// in the case of already-parsed templates
	if ( result !== initial.result ) {
		initial.result = result;
		result = parseIfString( result, ractive );
		return result;
	}
}

function getDynamicTemplate ( ractive, fn ) {
	const helper = createHelper( parser.getParseOptions( ractive ) );
	return fn.call( ractive, helper );
}

function createHelper ( parseOptions ) {
	const helper = create( parser );
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

	// Check that the template even exists
	else if ( template == undefined ) {
		throw new Error( `The template cannot be ${template}.` );
	}

	// Check the parsed template has a version at all
	else if ( typeof template.v !== 'number' ) {
		throw new Error( 'The template parser was passed a non-string template, but the template doesn\'t have a version.  Make sure you\'re passing in the template you think you are.' );
	}

	// Check we're using the correct version
	else if ( template.v !== TEMPLATE_VERSION ) {
		throw new Error( `Mismatched template version (expected ${TEMPLATE_VERSION}, got ${template.v}) Please ensure you are using the latest version of Ractive.js in your build process as well as in your app` );
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
