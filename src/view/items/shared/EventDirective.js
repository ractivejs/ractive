import { ANCHOR, COMPONENT, EVENT_DELEGATE } from '../../../config/types';
import fireEvent from '../../../events/fireEvent';
import { splitKeypath } from '../../../shared/keypaths';
import findElement from './findElement';
import { findInViewHierarchy } from '../../../shared/registry';
import { DOMEvent, CustomEvent } from '../element/ElementEvents';
import RactiveEvent from '../component/RactiveEvent';
import runloop from '../../../global/runloop';
import { addHelpers } from '../../helpers/contextMethods';
import { resolveArgs, setupArgsFn } from '../shared/directiveArgs';
import { warnOnceIfDebug } from '../../../utils/log';
import { addToArray, removeFromArray } from '../../../utils/array';
import noop from '../../../utils/noop';

const specialPattern = /^(event|arguments)(\..+)?$/;
const dollarArgsPattern = /^\$(\d+)(\..+)?$/;

export default class EventDirective {
	constructor ( options ) {
		this.owner = options.owner || options.parentFragment.owner || findElement( options.parentFragment );
		this.element = this.owner.attributeByName ? this.owner : findElement( options.parentFragment, true );
		this.template = options.template;
		this.parentFragment = options.parentFragment;
		this.ractive = options.parentFragment.ractive;
		this.delegated = this.template.t === EVENT_DELEGATE && this.template.f;
		this.delegate = this.template.t === EVENT_DELEGATE && !this.template.f;

		// check for delegated event
		if ( !this.delegated ) {
			this.events = [];

			if ( this.element.type === COMPONENT || this.element.type === ANCHOR ) {
				this.template.n.forEach( n => {
					this.events.push( new RactiveEvent( this.element, n ) );
				});
			} else {
				this.template.n.forEach( n => {
					const fn = findInViewHierarchy( 'events', this.ractive, n );
					// we need to pass in "this" in order to get
					// access to node when it is created.
					this.events.push( fn ? new CustomEvent( fn, this.element ) : new DOMEvent( n, this.element ) );
				});
			}
		}

		// method calls
		this.models = null;
	}

	bind () {
		addToArray(
			this.delegated ? this.element.delegates : this.element.events,
			this
		);

		if ( !this.delegate ) {
			setupArgsFn( this, this.template );
			if ( !this.fn ) this.action = this.template.f;
		}
	}

	destroyed () {
		if ( this.events ) this.events.forEach( e => e.unlisten() );
	}

	fire ( event, passedArgs = [] ) {
		// augment event object
		if ( event && !event.hasOwnProperty( 'proxy' ) ) {
			addHelpers( event, this.owner );
		}

		if ( this.delegate ) {
			if ( event.original ) {
				const end = this.element.node;
				let node = event.original.target;
				const name = event.name;
				// starting with the event target, walk up to the delegate's node looking for delegated listeners
				while ( node !== end ) {
					const el = node._ractive && node._ractive.proxy;
					if ( !el ) continue;
					let stop = false;

					event.node = el.node;
					event.proxy = el;
					// if the event gets proxied, the proxy name will overwrite the original name
					event.name = name;

					el.delegates.forEach( d => {
						if ( ~d.template.n.indexOf( event.name ) ) {
							if ( d.fire( event, passedArgs ) === false ) {
								stop = true;
							}
						}
					});

					if ( stop ) node = end;
					else node = event.node.parentNode;
				}
			}
		} else {
			if ( this.fn ) {
				const values = [];

				if ( event ) passedArgs.unshift( event );

				const models = resolveArgs( this, this.template, this.parentFragment, {
					specialRef ( ref ) {
						const specialMatch = specialPattern.exec( ref );
						if ( specialMatch ) {
							// on-click="foo(event.node)"
							return {
								special: specialMatch[1],
								keys: specialMatch[2] ? splitKeypath( specialMatch[2].substr(1) ) : []
							};
						}

						const dollarMatch = dollarArgsPattern.exec( ref );
						if ( dollarMatch ) {
							// on-click="foo($1)"
							return {
								special: 'arguments',
								keys: [ dollarMatch[1] - 1 ].concat( dollarMatch[2] ? splitKeypath( dollarMatch[2].substr( 1 ) ) : [] )
							};
						}
					}
				});

				if ( models ) {
					models.forEach( model => {
						if ( !model ) return values.push( undefined );

						if ( model.special ) {
							let obj = model.special === 'event' ? event : passedArgs;
							const keys = model.keys.slice();

							while ( keys.length ) obj = obj[ keys.shift() ];
							return values.push( obj );
						}

						if ( model.wrapper ) {
							return values.push( model.wrapperValue );
						}

						values.push( model.get() );
					});
				}

				// make event available as `this.event`
				const ractive = this.ractive;
				const oldEvent = ractive.event;

				ractive.event = event;
				const result = this.fn.apply( ractive, values ).pop();

				// Auto prevent and stop if return is explicitly false
				if ( result === false ) {
					const original = event ? event.original : undefined;
					if ( original ) {
						original.preventDefault && original.preventDefault();
						original.stopPropagation && original.stopPropagation();
					} else {
						warnOnceIfDebug( `handler '${this.template.n.join( ' ' )}' returned false, but there is no event available to cancel` );
					}
				}

				ractive.event = oldEvent;
				return result;
			}

			else {
				let args = [];
				if ( passedArgs.length ) args = args.concat( passedArgs );
				if ( event ) event.name = this.action;

				return fireEvent( this.ractive, this.action, {
					event,
					args
				});
			}
		}
	}

	handleChange () {}

	render () {
		// render events after everything else, so they fire after bindings
		if ( this.events ) runloop.scheduleTask( () => this.events.forEach( e => e.listen( this ), true ) );
	}

	toString() { return ''; }

	unbind () {
		removeFromArray(
			this.delegated ? this.element.delegates : this.element.events,
			this
		);
	}

	unrender () {
		if ( this.events ) this.events.forEach( e => e.unlisten() );
	}
}

EventDirective.prototype.update = noop;
