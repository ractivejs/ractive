define([
	'config/isClient',
	'config/errors',
	'config/initOptions',
	'config/registries',
	'utils/warn',
	'utils/create',
	'utils/extend',
	'utils/defineProperty',
	'utils/defineProperties',
	'utils/getElement',
	'utils/isObject',
	'utils/isArray',
	'utils/getGuid',
	'Ractive/prototype/get/magicAdaptor',
	'parse/_parse'
], function (
	isClient,
	errors,
	initOptions,
	registries,
	warn,
	create,
	extend,
	defineProperty,
	defineProperties,
	getElement,
	isObject,
	isArray,
	getGuid,
	magicAdaptor,
	parse
) {

	'use strict';

	return function ( ractive, options ) {

		var template, templateEl, parsedTemplate;

		if ( isArray( options.adaptors ) ) {
			warn( 'The `adaptors` option, to indicate which adaptors should be used with a given Ractive instance, has been deprecated in favour of `adapt`. See [TODO] for more information' );
			options.adapt = options.adaptors;
			delete options.adaptors;
		}

		// Options
		// -------
		initOptions.keys.forEach( function ( key ) {
			if ( options[ key ] === undefined ) {
				options[ key ] = ractive.constructor.defaults[ key ];
			}
		});


		// Initialisation
		// --------------

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

			// unresolved dependants
			_pendingResolution: { value: [] },

			// Create arrays for deferred attributes and evaluators etc
			_deferred: { value: {} },

			// Keep a list of used evaluators, so we don't duplicate them
			_evaluators: { value: create( null ) },

			// two-way bindings
			_twowayBindings: { value: {} },

			// transition manager
			_transitionManager: { value: null, writable: true },

			// animations (so we can stop any in progress at teardown)
			_animations: { value: [] },

			// nodes registry
			nodes: { value: {} },

			// property wrappers
			_wrapped: { value: create( null ) },

			// live queries
			_liveQueries: { value: [] },
			_liveComponentQueries: { value: [] },

			_updateScheduled: { value: false, writable: true }
		});

		defineProperties( ractive._deferred, {
			attrs: { value: [] },
			evals: { value: [] },
			selectValues: { value: [] },
			checkboxes: { value: [] },
			radios: { value: [] },
			observers: { value: [] },
			transitions: { value: [] },
			liveQueries: { value: [] },
			decorators: { value: [] },
			focusable: { value: null, writable: true },
			components: { value: [] }
		});

		// options
		ractive.adapt = options.adapt;
		ractive.modifyArrays = options.modifyArrays;
		ractive.magic = options.magic;
		ractive.twoway = options.twoway;
		ractive.lazy = options.lazy;
		ractive.debug = options.debug;

		if ( ractive.magic && !magicAdaptor ) {
			throw new Error( 'Getters and setters (magic mode) are not supported in this browser' );
		}

		// If this is a component, store a reference to the parent
		if ( options._parent ) {
			defineProperty( ractive, '_parent', {
				value: options._parent
			});
		}

		if ( options.el ) {
			ractive.el = getElement( options.el );
			if ( !ractive.el && ractive.debug ) {
				throw new Error( 'Could not find container element' );
			}
		}

		// Create local registry objects, with the global registries as prototypes
		if ( options.eventDefinitions ) {
			// TODO remove support
			warn( 'ractive.eventDefinitions has been deprecated in favour of ractive.events. Support will be removed in future versions' );
			options.events = options.eventDefinitions;
		}

		registries.forEach( function ( registry ) {
			if ( ractive.constructor[ registry ] ) {
				ractive[ registry ] = extend( create( ractive.constructor[ registry ] ), options[ registry ] );
			} else if ( options[ registry ] ) {
				ractive[ registry ] = options[ registry ];
			}
		});

		// Special case
		if ( !ractive.data ) {
			ractive.data = {};
		}



		// Parse template, if necessary
		template = options.template;

		if ( typeof template === 'string' ) {
			if ( !parse ) {
				throw new Error( errors.missingParser );
			}

			if ( template.charAt( 0 ) === '#' && isClient ) {
				// assume this is an ID of a <script type='text/ractive'> tag
				templateEl = document.getElementById( template.substring( 1 ) );
				if ( templateEl ) {
					parsedTemplate = parse( templateEl.innerHTML, options );
				}

				else {
					throw new Error( 'Could not find template element (' + template + ')' );
				}
			}

			else {
				parsedTemplate = parse( template, options );
			}
		} else {
			parsedTemplate = template;
		}

		// deal with compound template
		if ( isObject( parsedTemplate ) ) {
			extend( ractive.partials, parsedTemplate.partials );
			parsedTemplate = parsedTemplate.main;
		}

		// If the template was an array with a single string member, that means
		// we can use innerHTML - we just need to unpack it
		if ( parsedTemplate && ( parsedTemplate.length === 1 ) && ( typeof parsedTemplate[0] === 'string' ) ) {
			parsedTemplate = parsedTemplate[0];
		}

		ractive.template = parsedTemplate;

		// Add partials to our registry
		extend( ractive.partials, options.partials );

		ractive.parseOptions = {
			preserveWhitespace: options.preserveWhitespace,
			sanitize: options.sanitize,
			stripComments: options.stripComments
		};

		// Temporarily disable transitions, if noIntro flag is set
		ractive.transitionsEnabled = ( options.noIntro ? false : options.transitionsEnabled );

		// If we're in a browser, and no element has been specified, create
		// a document fragment to use instead
		if ( isClient && !ractive.el ) {
			ractive.el = document.createDocumentFragment();
		}

		// If the target contains content, and `append` is falsy, clear it
		if ( ractive.el && !options.append ) {
			ractive.el.innerHTML = '';
		}

		ractive.render( ractive.el, options.complete );

		// reset transitionsEnabled
		ractive.transitionsEnabled = options.transitionsEnabled;

		// end init sequence
		ractive._initing = false;
	};

});