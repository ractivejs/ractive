import { removeFromArray } from '../../../utils/array';
import fireEvent from '../../../events/fireEvent';
import Fragment from '../../Fragment';
import createFunction from '../../../shared/createFunction';
import { unbind } from '../../../shared/methodCallers';
import noop from '../../../utils/noop';
import resolveReference from '../../resolvers/resolveReference';

const eventPattern = /^event(?:\.(.+))?$/;
const argumentsPattern = /^arguments\.(\d*)$/;
const dollarArgsPattern = /^\$(\d*)$/;

export default class EventDirective {
	constructor ( owner, event, template ) {
		this.owner = owner;
		this.event = event;
		this.template = template;

		this.ractive = owner.parentFragment.ractive;
		this.parentFragment = owner.parentFragment;

		this.context = null;
		this.passthru = false;

		// method calls
		this.method = null;
		this.resolvers = null;
		this.models = null;
		this.argsFn = null;

		// handler directive
		this.action = null;
		this.args = null;
	}

	bind () {
		this.context = this.parentFragment.findContext();

		const template = this.template;

		if ( template.m ) {
			this.method = template.m;

			if ( this.passthru = template.g ) {
				// on-click="foo(...arguments)"
				// no models or args, just pass thru values
			}
			else {
				this.resolvers = [];
				this.models = template.a.r.map( ( ref, i ) => {
					if ( eventPattern.test( ref ) ) {
						// on-click="foo(event.node)"
						return {
							event: true,
							keys: ref.length > 5 ? ref.slice( 6 ).split( '.' ) : [],
							unbind: noop
						};
					}

					const argMatch = argumentsPattern.exec( ref );
					if ( argMatch ) {
						// on-click="foo(arguments[0])"
						return {
							argument: true,
							index: argMatch[1]
						};
					}

					const dollarMatch = dollarArgsPattern.exec( ref );
					if ( dollarMatch ) {
						// on-click="foo($1)"
						return {
							argument: true,
							index: dollarMatch[1] - 1
						};
					}

					let resolver;

					const model = resolveReference( this.parentFragment, ref );
					if ( !model ) {
						resolver = this.parentFragment.resolve( ref, model => {
							this.models[i] = model;
							removeFromArray( this.resolvers, resolver );
						});

						this.resolvers.push( resolver );
					}

					return model;
				});

				this.argsFn = createFunction( template.a.s, template.a.r.length );
			}

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

	fire ( event, passedArgs ) {
		// augment event object
		if ( event ) {
			event.keypath = this.context.getKeypath();
			event.context = this.context.get();
			event.index = this.parentFragment.indexRefs;

			if ( passedArgs ) passedArgs.unshift( event );
		}

		if ( this.method ) {
			if ( typeof this.ractive[ this.method ] !== 'function' ) {
				throw new Error( `Attempted to call a non-existent method ("${this.method}")` );
			}

			let args;

			if ( this.passthru ) {
				args = passedArgs;
			}
			else {
				const values = this.models.map( model => {
					if ( !model ) return undefined;

					if ( model.event ) {
						let obj = event;
						let keys = model.keys.slice();

						while ( keys.length ) obj = obj[ keys.shift() ];
						return obj;
					}

					if ( model.argument ) {
						return passedArgs ? passedArgs[ model.index ] : void 0;
					}

					if ( model.wrapper ) {
						return model.wrapper.value;
					}

					return model.get();
				});

				args = this.argsFn.apply( null, values );
			}


			// make event available as `this.event`
			const ractive = this.ractive;
			const oldEvent = ractive.event;

			ractive.event = event;
			ractive[ this.method ].apply( ractive, args );
			ractive.event = oldEvent;
		}

		else {
			const action = this.action.toString();
			let args = this.template.d ? this.args.getArgsList() : this.args;

			if ( event ) event.name = action;

			fireEvent( this.ractive, action, {
				event,
				args
			});
		}
	}

	rebind () {
		throw new Error( 'EventDirective$rebind not yet implemented!' ); // TODO add tests
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

		this.dirty = false;
	}
}
