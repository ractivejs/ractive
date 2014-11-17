import createTwowayBinding from 'virtualdom/items/Element/prototype/init/createTwowayBinding';
import createEventHandlers from 'virtualdom/items/Element/prototype/init/createEventHandlers';
import Decorator from 'virtualdom/items/Element/Decorator/_Decorator';
import isArray from 'utils/isArray';
import runloop from 'global/runloop';

export default {
	registerTwowayBinding: function( element ) {
		var binding, bindings;

		// clear out any old binding first
		if ( element.binding ) {
			this.unregisterTwowayBinding( element );
		}
		
		if ( element.twoway && ( binding = createTwowayBinding( element, element.template.a ) ) ) {
			element.binding = binding;

			// register element with the root, so that we can do ractive.updateModel()
			bindings = element.root._twowayBindings[ binding.keypath ] || ( element.root._twowayBindings[ binding.keypath ] = [] );
			bindings.push( binding );

			// if the element is already rendered, render the new binding
			if ( element.node ) {
				binding.render();
				element.node._ractive.binding = binding;
			}
		}
	},
	unregisterTwowayBinding: function( element ) {
		var binding, bindings;
		if ( binding = element.binding ) {
			binding.unrender();
			element.binding = undefined;

			element.node._ractive.binding = null;
			bindings = element.root._twowayBindings[ binding.keypath ];
			bindings.splice( bindings.indexOf( binding ), 1 );
		}
	},
	registerEventHandlers: function( element, events ) {
		events = events || element.template.v;
		let result = createEventHandlers( element, events );
		element.eventHandlers = ( element.eventHandlers || [] ).concat( result );
		return result;
	},
	unregisterEventHandlers: function( element, events ) {
		// if events is an array of named events to remove
		if ( isArray( events ) ) {
			let event;
			
			for ( event of events ) {
				let i = element.eventHandlers.length, h;

				// look them up and remove them
				while ( i-- ) {
					if ( ( h = element.eventHandlers[i] ) && h.name === event ) {
						h.unrender();
						element.eventHandlers.splice( i, 1 );
						break;
					}
				}
			}
		}

		// othewise, drop all events
		else if ( element.eventHandlers ) {
			element.eventHandlers.forEach( h => h.unrender() );
		}
	},
	registerDecorator: function( element, decorator ) {
		// if there's already a decorator, drop it
		if ( element.decorator ) {
			this.unregisterDecorator( element );
		}

		decorator = decorator || element.template.o;

		if ( decorator ) {
			element.decorator = new Decorator( element, decorator );

			// if the element is already rendered init the decorator
			if ( element.node && element.decorator.fn ) {
				runloop.scheduleTask( () => { 
					if ( !element.decorator.torndown ) {
						element.decorator.init();
					}
				}, true );
			}
		}
	},
	unregisterDecorator: function( element ) {
		if ( element.decorator ) {
			element.decorator.teardown();
		}
	},
	updateLaziness: function( element ) {
		if ( element.binding && element.binding.updateLaziness ) {
			element.binding.updateLaziness();
		}
	}
};
