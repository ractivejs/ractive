import { findInViewHierarchy } from 'shared/registry';
import { missingPlugin } from 'config/errors';
import { removeFromArray } from 'utils/array';
import fireEvent from 'events/fireEvent';
import Fragment from '../../Fragment';

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

	bind () {
		let fragment = this.parentFragment;
		while ( !fragment.context ) fragment = fragment.parent;
		this.context = fragment.context;

		if ( this.template.n && typeof this.template.n !== 'string' ) this.action.bind();
		if ( this.template.d ) this.args.bind();
	}

	bubble () {
		// noop - this doesn't affect anything else
	}

	fire ( event ) {
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
}
