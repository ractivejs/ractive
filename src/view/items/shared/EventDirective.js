import { COMPONENT } from '../../../config/types';
import { removeFromArray } from '../../../utils/array';
import fireEvent from '../../../events/fireEvent';
import Fragment from '../../Fragment';
import getFunction from '../../../shared/getFunction';
import { unbind } from '../../../shared/methodCallers';
import noop from '../../../utils/noop';
import resolveReference from '../../resolvers/resolveReference';
import { splitKeypath } from '../../../shared/keypaths';
import findElement from './findElement';
import { findInViewHierarchy } from '../../../shared/registry';
import { DOMEvent, CustomEvent } from '../element/ElementEvents';
import RactiveEvent from '../component/RactiveEvent';
import runloop from '../../../global/runloop';
import gatherRefs from '../../helpers/gatherRefs';

const eventPattern = /^event(?:\.(.+))?$/;
const argumentsPattern = /^arguments\.(\d*)$/;
const dollarArgsPattern = /^\$(\d*)$/;

export default class EventDirective {
	constructor ( options ) {
		this.owner = options.owner || options.parentFragment.owner || findElement( options.parentFragment );
		this.element = this.owner.attributeByName ? this.owner : findElement( options.parentFragment );
		this.template = options.template;
		this.parentFragment = options.parentFragment;
		this.ractive = options.parentFragment.ractive;

		this.events = [];

		if ( this.element.type === COMPONENT ) {
			this.template.n.split( '-' ).forEach( n => {
				this.events.push( new RactiveEvent( this.element.instance, n ) );
			});
		} else {
			this.template.n.split( '-' ).forEach( n => {
				const fn = findInViewHierarchy( 'events', this.ractive, n );
				// we need to pass in "this" in order to get
				// access to node when it is created.
				this.events.push(fn ? new CustomEvent( fn, this.element ) : new DOMEvent( n, this.element ));
			});
		}

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

		const template = this.template.f;

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

		if ( this.action && typeof this.action !== 'string' ) this.action.bind();
		if ( this.args && template.d ) this.args.bind();
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
			const refs = gatherRefs( this.parentFragment );
			event.keypath = this.context.getKeypath( this.ractive );
			event.rootpath = this.context.getKeypath();
			event.context = this.context.get();
			event.index = refs.index;
			event.key = refs.key;
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
			let args = this.template.f.d ? this.args.getArgsList() : this.args;

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
		// render events after everything else, so they fire after bindings
		runloop.scheduleTask( () => this.events.forEach( e => e.listen( this ), true ) );
	}

	toString() { return ''; }

	unbind () {
		const template = this.template.f;

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
		this.events.forEach( e => e.unlisten() );
	}

	update () {
		if ( this.method || !this.dirty ) return; // nothing to do

		this.dirty = false;

		// ugh legacy
		if ( this.action.update ) this.action.update();
		if ( this.template.f.d ) this.args.update();
	}
}
