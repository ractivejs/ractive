import config from 'config/configuration';
import initOptions from 'config/initOptions';
import warn from 'utils/warn';
import create from 'utils/create';
import defineProperties from 'utils/defineProperties';
import getElement from 'utils/getElement';
import isArray from 'utils/isArray';
import getGuid from 'utils/getGuid';
import get from 'shared/get';
import set from 'shared/set';
import magicAdaptor from 'shared/get/magicAdaptor';
import initialiseRegistries from 'Ractive/initialise/initialiseRegistries';
import Fragment from 'virtualdom/Fragment';

export default function initialiseRactiveInstance ( ractive, options ) {

	var defaults = ractive.constructor.defaults, keypath, el;

	// Allow empty constructor options and save for reset
	ractive.initOptions = options = options || {};

	setOptionsAndFlags( ractive, defaults, options );
	initialiseProperties( ractive, options );
	initialiseRegistries( ractive, defaults, options );

	config.init( ractive.constructor, ractive, options, ractive.data );

	// Render our *root fragment*
	ractive.fragment = new Fragment({
		template: ractive.template,
		root: ractive,
		owner: ractive, // saves doing `if ( this.parent ) { /*...*/ }` later on
	});

	// Special case - checkbox name bindings
	for ( keypath in ractive._checkboxNameBindings ) {
		if ( get( ractive, keypath ) === undefined ) {
			set( ractive, keypath, ractive._checkboxNameBindings[ keypath ].reduce( ( array, b ) => {
				if ( b.isChecked ) {
					array.push( b.element.getAttribute( 'value' ) );
				}
				return array;
			}, [] ));
		}
	}

	// If `el` is specified, render automatically
	if ( el = getElement( options.el ) ) {
		// Temporarily disable transitions, if `noIntro` flag is set
		ractive.transitionsEnabled = ( options.noIntro ? false : options.transitionsEnabled );

		// If the target contains content, and `append` is falsy, clear it
		if ( el && !options.append ) {
			// Tear down any existing instances on this element
			if ( el.__ractive_instances__ ) {
				el.__ractive_instances__.splice( 0 ).forEach( r => r.teardown() );
			}

			el.innerHTML = ''; // TODO is this quicker than removeChild? Initial research inconclusive
		}

		ractive.render( el, options.append ).then( function () {
			if ( options.complete ) {
				options.complete.call( ractive );
			}
		});

		// reset transitionsEnabled
		ractive.transitionsEnabled = options.transitionsEnabled;
	}
}

function setOptionsAndFlags ( ractive, defaults, options ) {

	deprecate( defaults );
	deprecate( options );

	// initOptions.keys.forEach( function ( key ) {
	// 	if ( options[ key ] === undefined ) {
	// 		options[ key ] = defaults[ key ];
	// 	}
	// });

	// // flag options
	// initOptions.flags.forEach( function ( flag ) {
	// 	ractive[ flag ] = options[ flag ];
	// });

	// special cases
	// if ( typeof ractive.adapt === 'string' ) {
	// 	ractive.adapt = [ ractive.adapt ];
	// }

	validate( ractive, options );
}

function deprecate ( options ){

	if ( isArray( options.adaptors ) ) {
		warn( 'The `adaptors` option, to indicate which adaptors should be used with a given Ractive instance, has been deprecated in favour of `adapt`.' );
		options.adapt = options.adaptors;
		delete options.adaptors;
	}

	if ( options.eventDefinitions ) {
		// TODO remove support
		warn( 'ractive.eventDefinitions has been deprecated in favour of ractive.events. Support will be removed in future versions' );
		options.events = options.eventDefinitions;
	}

}

function validate ( ractive ) {
	if ( ractive.magic && !magicAdaptor ) {
		throw new Error( 'Getters and setters (magic mode) are not supported in this browser' );
	}
}

function initialiseProperties ( ractive, options ) {

	// We use Object.defineProperties (where possible) as these should be read-only
	defineProperties( ractive, {
		// Generate a unique identifier, for places where you'd use a weak map if it
		// existed
		_guid: { value: getGuid() },

		// events
		_subs: { value: create( null ), configurable: true },

		// cache
		_cache: { value: {} }, // we need to be able to use hasOwnProperty, so can't inherit from null
		_cacheMap: { value: create( null ) },

		// storage for item configuration from instantiation to reset,
		// like dynamic functions or original values
		'_config': { value: {} },

		// dependency graph
		_deps: { value: [] },
		_depsMap: { value: create( null ) },

		_patternObservers: { value: [] },

		// Keep a list of used evaluators, so we don't duplicate them
		_evaluators: { value: create( null ) },

		// Computed properties
		_computations: { value: create( null ) },

		// two-way bindings
		_twowayBindings: { value: create( null ) },
		_checkboxNameBindings: { value: create( null ) },

		// animations (so we can stop any in progress at teardown)
		_animations: { value: [] },

		// nodes registry
		nodes: { value: {} },

		// property wrappers
		_wrapped: { value: create( null ) },

		// live queries
		_liveQueries: { value: [] },
		_liveComponentQueries: { value: [] },

		// components to init at the end of a mutation
		_childInitQueue: { value: [] },

		// data changes
		_changes: { value: [] },

		// failed lookups, when we try to access data from ancestor scopes
		_unresolvedImplicitDependencies: { value: [] }
	});

	//Save parse specific options
	ractive.parseOptions = {
		preserveWhitespace: options.preserveWhitespace,
		sanitize: options.sanitize,
		stripComments: options.stripComments,
		delimiters: options.delimiters,
		tripleDelimiters: options.tripleDelimiters,
		handlebars: options.handlebars
	};

	// If this is a component, store a reference to the parent
	if ( options._parent && options._component ) {
		defineProperties( ractive, {
			_parent: { value: options._parent },
			component: { value: options._component }
		});

		// And store a reference to the instance on the component
		options._component.instance = ractive;
	}

}
