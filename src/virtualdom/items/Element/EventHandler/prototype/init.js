import removeFromArray from 'utils/removeFromArray';
import getFunctionFromString from 'shared/getFunctionFromString';
import resolveRef from 'shared/resolveRef';
import Unresolved from 'shared/Unresolved';
import circular from 'circular';
import fireEvent from 'Ractive/prototype/shared/fireEvent';
import log from 'utils/log';

var Fragment, getValueOptions = { args: true }, eventPattern = /^event(?:\.(.+))?/;

circular.push( function () {
	Fragment = circular.Fragment;
});

export default function EventHandler$init ( element, name, template ) {
	var handler = this, action, args, indexRefs, ractive, parentFragment;

	handler.element = element;
	handler.root = element.root;
	handler.name = name;

	if( name.indexOf( '*' ) !== -1 ) {
		log.error({
			debug: this.root.debug,
			message: 'noElementProxyEventWildcards',
			args: {
				element: element.tagName,
				event: name
			}
		});

		this.invalid = true;
	}

	if ( template.m ) {
		// This is a method call
		handler.method = template.m;
		handler.args = args = [];
		handler.unresolved = [];
		handler.refs = template.a.r;
		handler.fn = getFunctionFromString( template.a.s, handler.refs.length );

		parentFragment = element.parentFragment;
		indexRefs = parentFragment.indexRefs;
		ractive = handler.root;

		// Create resolvers for each reference
		template.a.r.forEach( function ( reference, i ) {
			var index, keypath, match, unresolved;

			// Is this an index reference?
			if ( indexRefs && ( index = indexRefs[ reference ] ) !== undefined ) {
				args[i] = {
					indexRef: reference,
					value: index
				};
				return;
			}

			if ( match = eventPattern.exec( reference ) ) {
				args[i] = {
					eventObject: true,
					refinements: match[1] ? match[1].split( '.' ) : []
				};
				return;
			}

			// Can we resolve it immediately?
			if ( keypath = resolveRef( ractive, reference, parentFragment ) ) {
				args[i] = { keypath: keypath };
				return;
			}

			// Couldn't resolve yet
			args[i] = null;

			unresolved = new Unresolved( ractive, reference, parentFragment, function ( keypath ) {
				handler.resolve( i, keypath );
				removeFromArray( handler.unresolved, unresolved );
			});

			handler.unresolved.push( unresolved );
		});

		this.fire = fireMethodCall;
	}

	else {
		// Get action ('foo' in 'on-click='foo')
		action = template.n || template;
		if ( typeof action !== 'string' ) {
			action = new Fragment({
				template: action,
				root: this.root,
				owner: this
			});
		}

		this.action = action;

		// Get parameters
		if ( template.d ) {

			this.dynamicParams = new Fragment({
				template: template.d,
				root: this.root,
				owner: this.element
			});

			this.fire = fireEventWithDynamicParams;
		} else if ( template.a ) {
			this.params = template.a;
			this.fire = fireEventWithParams;
		}
	}
}


function fireMethodCall ( event ) {
	var ractive, values, args;

	ractive = this.root;

	if ( typeof ractive[ this.method ] !== 'function' ) {
		throw new Error( 'Attempted to call a non-existent method ("' + this.method + '")' );
	}

	values = this.args.map( function ( arg ) {
		var value, len, i;

		if ( !arg ) {
			// not yet resolved
			return undefined;
		}

		if ( arg.indexRef ) {
			return arg.value;
		}

		// TODO the refinements stuff would be better handled at parse time
		if ( arg.eventObject ) {
			value = event;

			if ( len = arg.refinements.length ) {
				for ( i = 0; i < len; i += 1 ) {
					value = value[ arg.refinements[i] ];
				}
			}
		} else {
			value = ractive.get( arg.keypath );
		}

		return value;
	});

	args = this.fn.apply( null, values );
	ractive[ this.method ].apply( ractive, args );
}

function fireEventWithParams ( event ) {
	fireEvent( this.root, this.getAction(), { event: event, args: this.params } );
}

function fireEventWithDynamicParams ( event ) {
	var args = this.dynamicParams.getValue( getValueOptions );

	// need to strip [] from ends if a string!
	if ( typeof args === 'string' ) {
		args = args.substr( 1, args.length - 2 );
	}

	fireEvent( this.root, this.getAction(), { event: event, args: args } );
}
