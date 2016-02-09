import { removeFromArray } from '../../../utils/array';
import fireEvent from '../../../events/fireEvent';
import Fragment from '../../Fragment';
import getFunction from '../../../shared/getFunction';
import { unbind } from '../../../shared/methodCallers';
import noop from '../../../utils/noop';
import resolveReference from '../../resolvers/resolveReference';
import { splitKeypath } from '../../../shared/keypaths';
import { ELEMENT } from '../../../config/types';

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

			// pass-thru "...arguments"
			this.passthru = !!template.g;

			if ( template.a ) {
				this.resolvers = [];
				this.models = template.a.r.map( ( ref, i ) => {

					if ( eventPattern.test( ref ) ) {
						// on-click="foo(event.node)"
						return {
							event: true,
							keys: ref.length > 5 ? splitKeypath( ref.slice( 6 ) ) : [],
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

				this.argsFn = getFunction( template.a.s, template.a.r.length );
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

	fire ( event, passedArgs = [] ) {

		// augment event object
		if ( event ) {
			event.keypath = this.context.getKeypath( this.ractive );
			event.rootpath = this.context.getKeypath();
			event.context = this.context.get();
			event.index = this.parentFragment.indexRefs;
			if ( this.owner.type === ELEMENT ) event.el = event.element = this.owner.node;
		}

		if ( this.method ) {
			if ( typeof this.ractive[ this.method ] !== 'function' ) {
				throw new Error( `Attempted to call a non-existent method ("${this.method}")` );
			}

			let args;

			if ( event ) passedArgs.unshift( event );

			if ( this.models ) {
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

			if ( this.passthru ) {
				args = args ? args.concat( passedArgs ) : passedArgs;
			}

			// make event available as `this.event`
			const ractive = this.ractive;
			const oldEvent = ractive.event;

			ractive.event = event;
			const result = ractive[ this.method ].apply( ractive, args );

			// Auto prevent and stop if return is explicitly false
			let original;
			if ( result === false && ( original = event.original ) ) {
				original.preventDefault && original.preventDefault();
				original.stopPropagation && original.stopPropagation();
			}

			ractive.event = oldEvent;
		}

		else {
			const action = this.action.toString();
			let args = this.template.d ? this.args.getArgsList() : this.args;

			if ( passedArgs.length ) args = args.concat( passedArgs );

			if ( event ) event.name = action;

			fireEvent( this.ractive, action, {
				event,
				args
			});
		}
	}

	rebind () {
		this.unbind();
		this.bind();
	}

	render () {
		this.event.listen( this );
	}

	unbind () {
		const template = this.template;

		if ( template.m ) {
			if ( this.resolvers ) this.resolvers.forEach( unbind );
			this.resolvers = [];

			this.models = null;
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
