import config from 'config/config';
import create from 'utils/create';
import defineProperties from 'utils/defineProperties';
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

	// Special case - checkbox name bindings
	setCheckboxBindings ( ractive )

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

	// We use Object.defineProperties (where possible) as these should be read-only
	defineProperties( ractive, {
		// Generate a unique identifier, for places where you'd use a weak map if it
		// existed
		_guid: { value: getGuid() },

		// events
		_subs: { value: create( null ), configurable: true },

		// storage for item configuration from instantiation to reset,
		// like dynamic functions or original values
		_config: { value: {} },

		_patternObservers: { value: [] },

		// two-way bindings
		_twowayBindings: { value: create( null ) },
		_checkboxNameBindings: { value: create( null ) },

		// animations (so we can stop any in progress at teardown)
		_animations: { value: [] },

		// nodes registry
		nodes: { value: {} },

		// live queries
		_liveQueries: { value: [] },
		_liveComponentQueries: { value: [] },

		// components to init at the end of a mutation
		_childInitQueue: { value: [] },

		// instance parseOptions are stored here
		parseOptions: { value: {} }
	});

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

function setCheckboxBindings ( ractive ) {

	for ( let keypath in ractive._checkboxNameBindings ) {
		if ( ractive.viewmodel.get( keypath ) === undefined ) {
			ractive.viewmodel.set( keypath, ractive._checkboxNameBindings[ keypath ].reduce( ( array, b ) => {
				if ( b.isChecked ) {
					array.push( b.element.getAttribute( 'value' ) );
				}
				return array;
			}, [] ));
		}
	}
}
