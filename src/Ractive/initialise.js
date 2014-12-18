import { getElement } from 'utils/dom';
import { create, extend } from 'utils/object';
import { magic } from 'config/environment';
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
	uid = 0;

export default initialiseRactiveInstance;

function initialiseRactiveInstance ( ractive, userOptions = {}, options = {} ) {
	var el;

	initialiseProperties( ractive, options );

	// TODO remove this - temporary, to help crossover to a data-less world
	Object.defineProperty( ractive, 'data', {
		get: () => {
			//console.trace( 'getting data (%s)', !!ractive.viewmodel );
			return ractive.viewmodel ? ractive.viewmodel.data : {};
		}
	});

	// make this option do what would be expected if someone
	// did include it on a new Ractive() or new Component() call.
	// Silly to do so (put a hook on the very options being used),
	// but handle it correctly, consistent with the intent.
	constructHook.fire( config.getConstructTarget( ractive, userOptions ), userOptions );

	// init config from Parent and options
	config.init( ractive.constructor, ractive, userOptions );

	// TODO this was moved from Viewmodel.extend - should be
	// rolled in with other config stuff
	if ( ractive.magic && !magic ) {
		throw new Error( 'Getters and setters (magic mode) are not supported in this browser' );
	}

	configHook.fire( ractive );
	initHook.begin( ractive );

	// TODO some of these properties probably shouldn't live on
	// the ractive instance at all
	ractive.viewmodel = new Viewmodel({
		adapt: ractive.adapt,
		data: combineData( ractive, ractive.constructor.prototype.data, userOptions.data ),
		mappings: options.mappings,
		computed: getComputationSignatures( ractive, ractive.computed ),
		ractive: ractive,
		debug: ractive.debug,
		onchange: () => runloop.addRactive( ractive )
	});

	// hacky circular problem until we get this sorted out
	// if viewmodel immediately processes computed properties,
	// they may call ractive.get, which calls ractive.viewmodel,
	// which hasn't been set till line above finishes.
	ractive.viewmodel.init();

	// Render our *root fragment*
	if ( ractive.template ) {
		ractive.fragment = new Fragment({
			template: ractive.template,
			root: ractive,
			owner: ractive, // saves doing `if ( this.parent ) { /*...*/ }` later on
		});
	}

	initHook.end( ractive );

	// render automatically ( if `el` is specified )
	if ( el = getElement( ractive.el ) ) {
		ractive.render( el, ractive.append );
	}
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

	if ( typeof child !== 'object' ) {
		throw new Error( '`data` option must be an object' );
	}

	if ( !parent ) {
		result = child;
	} else if ( typeof parent === 'function' ) {
		result = parent.call( context, child ) || child; // TODO don't pass in a `data` object - force use of `this.get()`?
	} else if ( typeof parent === 'object' ) {
		result = extend( {}, parent, child );
	}

	return result;
}
