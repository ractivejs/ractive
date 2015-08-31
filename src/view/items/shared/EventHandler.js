import { removeFromArray } from '../../../utils/array';
import fireEvent from '../../../events/fireEvent';
import Fragment from '../../Fragment';
import createFunction from '../../../shared/createFunction';
import { unbind } from '../../../shared/methodCallers';
import noop from '../../../utils/noop';
import resolveReference from '../../resolvers/resolveReference';

export default class EventHandler {
	constructor ( owner, event, template ) {
		this.owner = owner;
		this.event = event;
		this.template = template;

		this.ractive = owner.parentFragment.ractive;
		this.parentFragment = owner.parentFragment;
	}

	bind () {
		let fragment = this.parentFragment;
		while ( !fragment.context ) fragment = fragment.parent;
		this.context = fragment.context;

		const template = this.template;

		if ( template.m ) {
			this.method = template.m;

			this.resolvers = [];
			this.models = template.a.r.map( ( ref, i ) => {
				if ( /^event(?:\.(.+))?$/.test( ref ) ) {
					// on-click="foo(event.node)"
					return {
						event: true,
						keys: ref.length > 5 ? ref.slice( 6 ).split( '.' ) : [],
						unbind: noop
					};
				}

				const model = resolveReference( this.parentFragment, ref );

				if ( !model ) {
					const resolver = this.parentFragment.resolve( ref, model => {
						this.models[i] = model;
						removeFromArray( this.resolvers, resolver );
					});

					this.resolvers.push( resolver );
				}

				return model;
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
		// augment event object
		event.keypath = this.context.getKeypath();
		event.context = this.context.get();
		event.index = this.parentFragment.indexRefs;

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

				return model.get();
			});

			// make event available as `this.event`
			const oldEvent = this.ractive.event;
			this.ractive.event = event;

			const args = this.argsFn.apply( null, values );
			this.ractive[ this.method ].apply( this.ractive, args );

			this.ractive.event = oldEvent;
		}

		else {
			const action = this.action.toString();
			const args = this.template.d ? this.args.getArgsList() : this.args;

			event.name = action;

			fireEvent( this.ractive, action, {
				event,
				args
			});
		}
	}

	rebind () {
		throw new Error( 'EventHandler$rebind not yet implemented!' ); // TODO add tests
	}

	render () {
		this.event.listen( this );
	}

	unbind () {
		const template = this.template;

		if ( template.m ) {
			this.resolvers.forEach( unbind );
			this.resolvers = [];

			this.models.forEach( model => {
				if ( model ) model.unbind();
			});
		}

		else {
			// TODO this is brittle and non-explicit, fix it
			if ( this.action.unbind ) this.action.unbind();
			if ( this.args.unbind ) this.args.unbind();
		}
	}

	unrender () {
		this.event.unlisten();
	}

	update () {
		if ( this.method ) return; // nothing to do

		// ugh legacy
		if ( this.action.update ) this.action.update();
		if ( this.template.d ) this.args.update();
	}
}
