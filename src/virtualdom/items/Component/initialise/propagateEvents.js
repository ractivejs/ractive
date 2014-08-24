import circular from 'circular';
import fireEvent from 'Ractive/prototype/shared/fireEvent';
import log from 'utils/log';

// TODO how should event arguments be handled? e.g.
// <widget on-foo='bar:1,2,3'/>
// The event 'bar' will be fired on the parent instance
// when 'foo' fires on the child, but the 1,2,3 arguments
// will be lost

var Fragment, getValueOptions = { args: true };

circular.push( function () {
	Fragment = circular.Fragment;
});

export default function propagateEvents ( component, eventsDescriptor ) {
	var eventName;

	for ( eventName in eventsDescriptor ) {
		if ( eventsDescriptor.hasOwnProperty( eventName ) ) {
			// if( eventName === '*' ) {
				// To be determined, I don't thin this is right way go...

				// // TODO: allow dynamic fragments
				// let namespace = eventsDescriptor[ eventName ];
				// namespace = namespace.n || namespace;

				// if ( typeof namespace !== 'string' ) {
				// 	namespace = = new Fragment({
				// 		template: action,
				// 		root: this.root,
				// 		owner: this
				// 	});


				// 	namespace = namespace.trim();
				// }
				// else if ( namespace && namespace.n && namespace.n.length )
				// if ( !namespace || namespace === '*' || ( namespace.n && !namespace.n.length ) ) {
				// 	namespace = component.name;
				// }

				// component.eventNamespace = namespace;

			// } else {
				propagateEvent( component.instance, component.root, eventName, eventsDescriptor[ eventName ] );
			// }
		}
	}
}

function propagateEvent ( childInstance, parentInstance, eventName, proxyEventName ) {

	if ( typeof proxyEventName !== 'string' ) {

		log.error({
			debug: parentInstance.debug,
			message: 'noComponentEventArguments'
		});
	}

	childInstance.on( eventName, function () {
		var fragment = this.component.parentFragment,
			options = {
				event: {
					component: this,
					index: fragment.indexRefs,
					keypath: fragment.context,
					context: parentInstance.get( fragment.context )
				},
				args: Array.prototype.slice.call( arguments ),
			};

		fireEvent( parentInstance, proxyEventName, options );
	});
}
