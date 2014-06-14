import config from 'config/config';
import create from 'utils/create';
import getElement from 'utils/getElement';
import getGuid from 'utils/getGuid';
import Viewmodel from 'viewmodel/Viewmodel';
import Fragment from 'virtualdom/Fragment';

export default function initialiseRactiveInstance ( ractive, options = {} ) {

	initialiseProperties( ractive, options );

	// TEMPORARY. This is so we can implement Viewmodel gradually
	ractive.viewmodel = new Viewmodel( ractive );

	// init config from Parent and options
	config.init( ractive.constructor, ractive, options );

	// hacky circular problem until we get this sorted out
	ractive.viewmodel.compute();

	// Render our *root fragment*
	ractive.fragment = new Fragment({
		template: ractive.template || [], // hmm, does this mean we don't need to create the fragment?
		root: ractive,
		owner: ractive, // saves doing `if ( this.parent ) { /*...*/ }` later on
	});

	// render automatically ( if `el` is specified )
	tryRender( ractive );
}

function tryRender ( ractive ) {
	var el;

	if ( el = getElement( ractive.el ) ) {

		let wasEnabled = ractive.transitionsEnabled;

		// Temporarily disable transitions, if `noIntro` flag is set
		if ( ractive.noIntro ) {
			ractive.transitionsEnabled = false;
		}

		// If the target contains content, and `append` is falsy, clear it
		if ( el && !ractive.append ) {
			// Tear down any existing instances on this element
			if ( el.__ractive_instances__ ) {
				el.__ractive_instances__.splice( 0 ).forEach( r => r.teardown() );
			}

			el.innerHTML = ''; // TODO is this quicker than removeChild? Initial research inconclusive
		}

		ractive.render( el, ractive.append ).then( function () {
			if ( ractive.complete ) {
				ractive.complete.call( ractive );
			}
		});

		// reset transitionsEnabled
		ractive.transitionsEnabled = wasEnabled;
	}
}

function initialiseProperties ( ractive, options ) {

	// Generate a unique identifier, for places where you'd use a weak map if it
	// existed
	ractive._guid = getGuid();

	// events
	ractive._subs = create( null );

	// storage for item configuration from instantiation to reset,
	// like dynamic functions or original values
	ractive._config = {};

	ractive._patternObservers = [];

	// two-way bindings
	ractive._twowayBindings = create( null );

	// animations (so we can stop any in progress at teardown)
	ractive._animations = [];

	// nodes registry
	ractive.nodes = {};

	// live queries
	ractive._liveQueries = [];
	ractive._liveComponentQueries = [];

	// components to init at the end of a mutation
	ractive._childInitQueue = [];

	// If this is a component, store a reference to the parent
	if ( options._parent && options._component ) {

		ractive._parent = options._parent;
		ractive.component = options._component;

		// And store a reference to the instance on the component
		options._component.instance = ractive;
	}
}
