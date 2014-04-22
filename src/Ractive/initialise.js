define([
	'config/initOptions',
	'utils/warn',
	'utils/create',
	'utils/extend',
	'utils/defineProperties',
	'utils/getElement',
	'utils/isArray',
	'utils/getGuid',
	'shared/get/magicAdaptor',
	'Ractive/initialise/initialiseRegistries',
	'Ractive/initialise/renderInstance'

], function (
	initOptions,
	warn,
	create,
	extend,
	defineProperties,
	getElement,
	isArray,
	getGuid,
	magicAdaptor,
	initialiseRegistries,
	renderInstance
) {

	'use strict';

	var flags = [ 'adapt', 'modifyArrays', 'magic', 'twoway', 'lazy', 'debug', 'isolated' ];
	
	return function initialiseRactiveInstance ( ractive, options ) {

		var defaults = ractive.constructor.defaults;

		//allow empty constructor options and save for reset
		ractive.initOptions = options = options || {};

		setOptionsAndFlags( ractive, defaults, options );

		//sets ._initing = true
		initialiseProperties( ractive, options ); 
		
		initialiseRegistries( ractive, defaults, options );
		
		renderInstance( ractive, options );

		// end init sequence
		ractive._initing = false;
	};

	function setOptionsAndFlags ( ractive, defaults, options ) {

		deprecate( defaults );
		deprecate( options );

		initOptions.keys.forEach( function ( key ) {
			if ( options[ key ] === undefined ) {
				options[ key ] = defaults[ key ];
			}
		});

		// flag options
		flags.forEach( function ( flag ) {
			ractive[ flag ] = options[ flag ];
		});

		// special cases
		if ( typeof ractive.adapt === 'string' ) {
			ractive.adapt = [ ractive.adapt ];
		}

		validate( ractive, options );
	}

	function deprecate ( options ){

		if ( isArray( options.adaptors ) ) {
			warn( 'The `adaptors` option, to indicate which adaptors should be used with a given Ractive instance, has been deprecated in favour of `adapt`. See [TODO] for more information' );
			options.adapt = options.adaptors;
			delete options.adaptors;
		}

		if ( options.eventDefinitions ) {
			// TODO remove support
			warn( 'ractive.eventDefinitions has been deprecated in favour of ractive.events. Support will be removed in future versions' );
			options.events = options.eventDefinitions;
		}

	}

	function validate ( ractive, options ) {

		if ( ractive.magic && !magicAdaptor ) {
			throw new Error( 'Getters and setters (magic mode) are not supported in this browser' );
		}

		if ( options.el ) {
			ractive.el = getElement( options.el );
			if ( !ractive.el && ractive.debug ) {
				throw new Error( 'Could not find container element' );
			}
		}
	}

	function initialiseProperties ( ractive, options ) {

		// We use Object.defineProperties (where possible) as these should be read-only
		defineProperties( ractive, {
			_initing: { value: true, writable: true },

			// Generate a unique identifier, for places where you'd use a weak map if it
			// existed
			_guid: { value: getGuid() },

			// events
			_subs: { value: create( null ), configurable: true },

			// cache
			_cache: { value: {} }, // we need to be able to use hasOwnProperty, so can't inherit from null
			_cacheMap: { value: create( null ) },

			// dependency graph
			_deps: { value: [] },
			_depsMap: { value: create( null ) },

			_patternObservers: { value: [] },

			// Keep a list of used evaluators, so we don't duplicate them
			_evaluators: { value: create( null ) },

			// Computed properties
			_computations: { value: create( null ) },

			// two-way bindings
			_twowayBindings: { value: {} },

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
			tripleDelimiters: options.tripleDelimiters
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

});