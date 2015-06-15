import { findInViewHierarchy } from 'shared/registry';
import { missingPlugin } from 'config/errors';
import { removeFromArray } from 'utils/array';
import fireEvent from 'events/fireEvent';
import Fragment from '../../Fragment';
import ReferenceResolver from '../../resolvers/ReferenceResolver';
import createFunction from 'shared/createFunction';
import noop from 'utils/noop';

function defaultHandler ( event ) {
	const handler = this._ractive.events[ event.type ];

	handler.fire({
		node: this,
		original: event
	});
}

export default class EventHandler {
	constructor ( owner, name, template ) {
		this.owner = owner;
		this.name = name;
		this.template = template;

		this.ractive = owner.parentFragment.ractive;
		this.parentFragment = owner.parentFragment;
		this.node = null;

		if ( template.m ) {
			this.method = template.m;

			this.models = new Array( template.a.r.length );
			this.resolvers = template.a.r.map( ( ref, i ) => {
				if ( /^event\.?/.test( ref ) ) {
					// on-click="foo(event.node)"
					this.models[i] = {
						event: true,
						keys: ref.length > 5 ? ref.slice( 6 ).split( '.' ) : []
					};

					return { unbind: noop };
				}

				return new ReferenceResolver( this.parentFragment, ref, model => {
					this.models[i] = model;
				});
			});

			this.argsFn = createFunction( template.a.s, template.a.r.length );
		}

		else {
			// TODO deprecate this style of directive
			this.action = typeof template === 'string' ? // on-click='foo'
				template :
				typeof template.n === 'string' ? // on-click='{{dynamic}}'
					template.n :
					new Fragment({
						owner: this,
						template: template.n
					});

			this.args = template.a ? // static arguments
				( typeof template.a === 'string' ? [ template.a ] : template.a ) :
				template.d ? // dynamic arguments
					new Fragment({
						owner: this,
						template: template.d
					}) :
					[]; // no arguments
		}
	}

	bind () {
		let fragment = this.parentFragment;
		while ( !fragment.context ) fragment = fragment.parent;
		this.context = fragment.context;

		if ( this.template.n && typeof this.template.n !== 'string' ) this.action.bind();
		if ( this.template.d ) this.args.bind();
	}

	bubble () {
		if ( !this.dirty ) {
			this.dirty = true;
			this.owner.bubble();
		}
	}

	fire ( event ) {
		if ( this.method ) {
			if ( typeof this.ractive[ this.method ] !== 'function' ) {
				throw new Error( `Attempted to call a non-existent method ("${this.method}")` );
			}

			const values = this.models.map( model => {
				if ( !model ) return undefined;

				if ( model.event ) {
					let obj = event;
					let keys = model.keys.slice();

					while ( keys.length ) obj = obj[ keys.shift() ];
					return obj;
				}

				if ( model.wrapper ) {
					return model.wrapper.value;
				}

				return model.value;
			});

			const args = this.argsFn.apply( null, values );
			this.ractive[ this.method ].apply( this.ractive, args );
		}

		else {
			const action = this.action.toString();
			const args = this.template.d ? this.args.getArgsList() : this.args;

			event.name = action;
			event.keypath = this.context.getKeypath();
			event.context = this.context.value;
			event.index = this.parentFragment.indexRefs;

			fireEvent( this.ractive, action, {
				event,
				args
			});
		}
	}

	render () {
		this.node = this.owner.node;

		const fn = findInViewHierarchy( 'events', this.ractive, this.name );

		if ( fn ) {
			const fire = event => this.fire( event );
			this.customHandler = fn( this.node, fire );
		} else {
			// no plugin - most likely a standard DOM event
			if ( !( `on${this.name}` in this.node ) ) {
				missingPlugin( this.name, 'events' );
			}

			this.node._ractive.events[ this.name ] = this;
			this.node.addEventListener( this.name, defaultHandler, false );
		}
	}

	unrender () {
		if ( this.customHandler ) {
			this.customHandler.teardown();
		} else {
			this.node.removeEventListener( this.name, defaultHandler, false );
			this.node._ractive.events[ this.name ] = null;
		}
	}

	update () {
		if ( this.method ) return; // nothing to do

		// ugh legacy
		if ( this.action.update ) this.action.update();
		if ( this.template.d ) this.args.update();
	}
}
