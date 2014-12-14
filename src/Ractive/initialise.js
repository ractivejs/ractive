import { getElement } from 'utils/dom';
import { create } from 'utils/object';
import { magic } from 'config/environment';
import config from 'Ractive/config/config';
import Fragment from 'virtualdom/Fragment';
import Viewmodel from 'viewmodel/Viewmodel';
import Hook from './prototype/shared/hooks/Hook';
import HookQueue from './prototype/shared/hooks/HookQueue';

var constructHook = new Hook( 'construct' ),
	configHook = new Hook( 'config' ),
	initHook = new HookQueue( 'init' ),
	uid = 0;

export default initialiseRactiveInstance;

function initialiseRactiveInstance ( ractive, userOptions = {}, options = {} ) {
	var el;

	initialiseProperties( ractive, options );

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

	// TEMPORARY. This is so we can implement Viewmodel gradually
	ractive.viewmodel = new Viewmodel( ractive, options.mappings );

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
