import { fatal } from 'utils/log';
import { missingPlugin } from 'config/errors';
import { magic } from 'config/environment';
import { ensureArray } from 'utils/array';
import { findInViewHierarchy } from 'shared/registry';
import arrayAdaptor from 'Ractive/static/adaptors/array/index';
import magicAdaptor from 'Ractive/static/adaptors/magic';
import magicArrayAdaptor from 'Ractive/static/adaptors/magicArray';
import { getElement } from 'utils/dom';
import { create, extend } from 'utils/object';
import { isEmptyObject } from 'utils/is';
import runloop from 'global/runloop';
import config from 'Ractive/config/config';
import Fragment from 'virtualdom/Fragment';
import Viewmodel from 'viewmodel/Viewmodel';
import Hook from './prototype/shared/hooks/Hook';
import HookQueue from './prototype/shared/hooks/HookQueue';
import getComputationSignatures from './helpers/getComputationSignatures';

var constructHook = new Hook( 'construct' ),
	configHook = new Hook( 'config' ),
	initHook = new HookQueue( 'init' ),
	uid = 0,
	registryNames;

registryNames = [
	'adaptors',
	'components',
	'decorators',
	'easing',
	'events',
	'interpolators',
	'partials',
	'transitions'
];

export default initialiseRactiveInstance;

function initialiseRactiveInstance ( ractive, userOptions = {}, options = {} ) {
	var el, viewmodel;

	initialiseProperties( ractive, options );

	// TODO remove this - temporary, to help crossover to a data-less world
	Object.defineProperty( ractive, 'data', {
		get: () => {
			//console.trace( 'getting data (%s)', !!ractive.viewmodel );
			return ractive.viewmodel ? ractive.viewmodel.data : {};
		}
	});

	// TODO don't allow `onconstruct` with `new Ractive()`, there's no need for it
	constructHook.fire( config.getConstructTarget( ractive, userOptions ), userOptions );

	// Add registries
	registryNames.forEach( name => {
		ractive[ name ] = extend( create( ractive.constructor[ name ] || null ), userOptions[ name ] );
	});

	// Create a viewmodel
	viewmodel = new Viewmodel({
		adapt: getAdaptors( ractive, ractive.adapt, userOptions ),
		data: combineData( ractive, ractive.constructor.prototype.data, userOptions.data ),
		computed: getComputationSignatures( ractive, extend( create( ractive.constructor.prototype.computed ), userOptions.computed ) ),
		mappings: options.mappings,
		ractive: ractive,
		onchange: () => runloop.addRactive( ractive )
	});

	ractive.viewmodel = viewmodel;
	viewmodel.debug = ractive.debug;

	// init config from Parent and options
	config.init( ractive.constructor, ractive, userOptions );

	// TODO this was moved from Viewmodel.extend - should be
	// rolled in with other config stuff
	if ( ractive.magic && !magic ) {
		throw new Error( 'Getters and setters (magic mode) are not supported in this browser' );
	}

	configHook.fire( ractive );
	initHook.begin( ractive );

	// If this is a component with a function `data` property, call the function
	// with `ractive` as context
	if ( typeof ractive.constructor.prototype.data === 'function' ) {
		viewmodel.reset( ractive.constructor.prototype.data.call( ractive ) || fatal( '`data` functions must return a data object' ) );
	}

	// This can't happen earlier, because computed properties may call `ractive.get()`, etc
	viewmodel.init();

	// Render virtual DOM
	if ( ractive.template ) {
		let cssIds;

		if ( options.cssIds || ractive.constructor.css ) {
			cssIds = options.cssIds ? options.cssIds.slice() : [];

			if ( ractive.constructor.css ) {
				cssIds.push( ractive.constructor._guid );
			}
		}

		ractive.fragment = new Fragment({
			template: ractive.template,
			root: ractive,
			owner: ractive, // saves doing `if ( this.parent ) { /*...*/ }` later on
			cssIds
		});
	}

	initHook.end( ractive );

	// render automatically ( if `el` is specified )
	if ( el = getElement( ractive.el ) ) {
		ractive.render( el, ractive.append );
	}
}

function getAdaptors ( ractive, protoAdapt, userOptions ) {
	var adapt, magic, modifyArrays;

	protoAdapt = protoAdapt.map( lookup );
	adapt = ensureArray( userOptions.adapt ).map( lookup );

	adapt = combine( protoAdapt, adapt );

	magic = 'magic' in userOptions ? userOptions.magic : ractive.magic;
	modifyArrays = 'modifyArrays' in userOptions ? userOptions.modifyArrays : ractive.modifyArrays;

	if ( magic ) {
		if ( !magic ) {
			throw new Error( 'Getters and setters (magic mode) are not supported in this browser' );
		}

		if ( modifyArrays ) {
			adapt.push( magicArrayAdaptor );
		}

		adapt.push( magicAdaptor );
	}

	if ( modifyArrays ) {
		adapt.push( arrayAdaptor );
	}

	return adapt;


	function lookup ( adaptor ) {
		if ( typeof adaptor === 'string' ) {
			adaptor = findInViewHierarchy( 'adaptors', ractive, adaptor );

			if ( !adaptor ) {
				fatal( missingPlugin( adaptor, 'adaptor' ) );
			}
		}

		return adaptor;
	}
}

function combine ( a, b ) {
	var c = a.slice(), i = b.length;

	while ( i-- ) {
		if ( !~c.indexOf( b[i] ) ) {
			c.push( b[i] );
		}
	}

	return c;
}

function initialiseProperties ( ractive, options ) {
	// Generate a unique identifier, for places where you'd use a weak map if it
	// existed
	ractive._guid = 'r-' + uid++;

	// events
	ractive._subs = create( null );

	// storage for item configuration from instantiation to reset,
	// like dynamic functions or original values
	ractive._config = {};

	// two-way bindings
	ractive._twowayBindings = create( null );

	// animations (so we can stop any in progress at teardown)
	ractive._animations = [];

	// nodes registry
	ractive.nodes = {};

	// live queries
	ractive._liveQueries = [];
	ractive._liveComponentQueries = [];

	// bound data functions
	ractive._boundFunctions = [];


	// properties specific to inline components
	if ( options.component ) {
		ractive.parent = options.parent;
		ractive.container = options.container || null;
		ractive.root = ractive.parent.root;

		ractive.component = options.component;
		options.component.instance = ractive;

		// for hackability, this could be an open option
		// for any ractive instance, but for now, just
		// for components and just for ractive...
		ractive._inlinePartials = options.inlinePartials;
	} else {
		ractive.root = ractive;
		ractive.parent = ractive.container = null;
	}
}

function combineData ( context, parent, child ) {
	var result;

	if ( !child ) {
		child = create( null );
	}

	if ( typeof child === 'function' ) {
		// TODO this seems like a mythical use case. Should we continue to support it?
		// Makes sense with `Ractive.extend(...)`, but less so with `new Ractive(...)`
		child = child.call( context );
	}

	if ( typeof child !== 'object' ) {
		throw new Error( 'data option must be an object or a function, "' + child + '" is not valid' );
	}

	if ( typeof parent === 'object' && !isEmptyObject( parent ) ) {
		result = extend( {}, parent, child );
	} else {
		result = child;
	}

	return result;
}
