import { fatal, logIfDebug, warnIfDebug, warnOnceIfDebug, welcome } from 'utils/log';
import { missingPlugin } from 'config/errors';
import { magic as magicSupported } from 'config/environment';
import { ensureArray } from 'utils/array';
import { findInViewHierarchy } from 'shared/registry';
import arrayAdaptor from 'Ractive/static/adaptors/array/index';
import magicAdaptor from 'Ractive/static/adaptors/magic';
import magicArrayAdaptor from 'Ractive/static/adaptors/magicArray';
import { getElement } from 'utils/dom';
import { create, defineProperty, extend } from 'utils/object';
import runloop from 'global/runloop';
import config from 'Ractive/config/config';
import dataConfigurator from 'Ractive/config/custom/data';
import Fragment from 'virtualdom/Fragment';
import Viewmodel from 'viewmodel/Viewmodel';
import Hook from './prototype/shared/hooks/Hook';
import HookQueue from './prototype/shared/hooks/HookQueue';
import getComputationSignatures from './helpers/getComputationSignatures';
import Ractive from '../Ractive';

let constructHook = new Hook( 'construct' );
let configHook = new Hook( 'config' );
let initHook = new HookQueue( 'init' );
let uid = 0;

let registryNames = [
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
	var el, viewmodel, computed;

	if ( Ractive.DEBUG ) {
		welcome();
	}

	initialiseProperties( ractive, options );

	// TODO remove this, eventually
	defineProperty( ractive, 'data', { get: deprecateRactiveData });

	// TODO don't allow `onconstruct` with `new Ractive()`, there's no need for it
	constructHook.fire( ractive, userOptions );

	// Add registries
	registryNames.forEach( name => {
		ractive[ name ] = extend( create( ractive.constructor[ name ] || null ), userOptions[ name ] );
	});

	computed = extend( create( ractive.constructor.prototype.computed ), userOptions.computed );

	// Create a viewmodel
	viewmodel = new Viewmodel({
		adapt: getAdaptors( ractive, ractive.adapt, userOptions ),
		data: dataConfigurator.init( ractive.constructor, ractive, userOptions ),
		mappings: options.mappings,
		computations: getComputationSignatures( ractive, computed ),
		ractive: ractive,
		onchange: () => runloop.addRactive( ractive )
	});

	ractive.viewmodel = viewmodel;

	// This can't happen earlier, because computed properties may call `ractive.get()`, etc
	viewmodel.init();

	// init config from Parent and options
	config.init( ractive.constructor, ractive, userOptions );

	configHook.fire( ractive );
	initHook.begin( ractive );

	// // If this is a component with a function `data` property, call the function
	// // with `ractive` as context (unless the child was also a function)
	// if ( typeof ractive.constructor.prototype.data === 'function' && typeof userOptions.data !== 'function' ) {
	// 	viewmodel.reset( ractive.constructor.prototype.data.call( ractive ) || fatal( '`data` functions must return a data object' ) );
	// }


	// Render virtual DOM
	if ( ractive.template ) {
		let cssIds;

		if ( options.cssIds || ractive.cssId ) {
			cssIds = options.cssIds ? options.cssIds.slice() : [];

			if ( ractive.cssId ) {
				cssIds.push( ractive.cssId );
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
		let promise = ractive.render( el, ractive.append );

		if ( Ractive.DEBUG_PROMISES ) {
			promise.catch( err => {
				warnOnceIfDebug( 'Promise debugging is enabled, to help solve errors that happen asynchronously. Some browsers will log unhandled promise rejections, in which case you can safely disable promise debugging:\n  Ractive.DEBUG_PROMISES = false;' );
				warnIfDebug( 'An error happened during rendering', { ractive });
				err.stack && logIfDebug( err.stack );

				throw err;
			});
		}
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
		if ( !magicSupported ) {
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

function deprecateRactiveData () {
	throw new Error( 'Using `ractive.data` is no longer supported - you must use the `ractive.get()` API instead' );
}
