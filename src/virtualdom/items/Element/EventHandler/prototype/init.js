import getFunctionFromString from 'shared/getFunctionFromString';
import createReferenceResolver from 'virtualdom/items/shared/Resolvers/createReferenceResolver';
import Fragment from 'virtualdom/Fragment';
import eventStack from 'Ractive/prototype/shared/eventStack';
import fireEvent from 'Ractive/prototype/shared/fireEvent';
import { fatal, warn } from 'utils/log';

var eventPattern = /^event(?:\.(.+))?/;

export default function EventHandler$init ( element, name, template ) {
	var action, refs, ractive;

	this.element = element;
	this.root = element.root;
	this.parentFragment = element.parentFragment;
	this.name = name;

	if ( name.indexOf( '*' ) !== -1 ) {
		( this.root.debug ? fatal : warn )( 'Only component proxy-events may contain "*" wildcards, <%s on-%s="..."/> is not valid', element.name, name );
		this.invalid = true;
	}

	if ( template.m ) {
		refs = template.a.r;

		// This is a method call
		this.method = template.m;
		this.keypaths = [];
		this.fn = getFunctionFromString( template.a.s, refs.length );

		this.parentFragment = element.parentFragment;
		ractive = this.root;

		// Create resolvers for each reference
		this.refResolvers = [];
		refs.forEach(( ref, i ) => {
			let match;

			// special case - the `event` object
			if ( match = eventPattern.exec( ref ) ) {
				this.keypaths[i] = {
					eventObject: true,
					refinements: match[1] ? match[1].split( '.' ) : []
				};
			}

			else {
				this.refResolvers.push( createReferenceResolver( this, ref, keypath => this.resolve( i, keypath ) ) );
			}
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

	values = this.keypaths.map( function ( keypath ) {
		var value, len, i;

		if ( keypath === undefined ) {
			// not yet resolved
			return undefined;
		}

		// TODO the refinements stuff would be better handled at parse time
		if ( keypath.eventObject ) {
			value = event;

			if ( len = keypath.refinements.length ) {
				for ( i = 0; i < len; i += 1 ) {
					value = value[ keypath.refinements[i] ];
				}
			}
		} else {
			value = ractive.viewmodel.get( keypath );
		}

		return value;
	});

	eventStack.enqueue( ractive, event );

	args = this.fn.apply( null, values );
	ractive[ this.method ].apply( ractive, args );

	eventStack.dequeue( ractive );
}

function fireEventWithParams ( event ) {
	fireEvent( this.root, this.getAction(), { event: event, args: this.params } );
}

function fireEventWithDynamicParams ( event ) {
	var args = this.dynamicParams.getArgsList();

	// need to strip [] from ends if a string!
	if ( typeof args === 'string' ) {
		args = args.substr( 1, args.length - 2 );
	}

	fireEvent( this.root, this.getAction(), { event: event, args: args } );
}
